import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  paymentTransactions,
  leaseApprovalFees,
  webhookEvents,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { validateWebhookSignature } from "@/lib/utils/wompi";

interface WompiWebhookEvent {
  event:
    | "transaction.updated"
    | "nequi_token.updated"
    | "bancolombia_transfer_token.updated";
  data: {
    transaction: {
      id: string;
      reference: string;
      status: "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
      amount_in_cents: number;
      currency: string;
      customer_email: string;
      payment_method_type?: string;
      payment_method?: {
        type: string;
      };
      finalized_at?: string;
    };
  };
  sent_at: string;
  signature: {
    properties: string[];
    timestamp: number;
    checksum: string;
  };
}

export async function POST(req: Request) {
  try {
    const event: WompiWebhookEvent = await req.json();
    const receivedChecksum =
      req.headers.get("x-event-checksum") || event.signature.checksum;

    // Extract property values in order
    const propertyValues = event.signature.properties.map((prop) => {
      const keys = prop.split(".");
      let value: any = event;
      for (const key of keys) {
        value = value?.[key];
      }
      return String(value || "");
    });

    // Validate signature
    const isValid = validateWebhookSignature(
      propertyValues,
      event.signature.timestamp,
      receivedChecksum
    );

    // Log webhook event
    const [webhookLog] = await db
      .insert(webhookEvents)
      .values({
        eventType: event.event,
        receivedChecksum,
        calculatedChecksum: isValid ? receivedChecksum : "INVALID",
        isValid,
        payload: JSON.stringify(event),
        processed: false,
      })
      .returning();

    if (!isValid) {
      console.error("Invalid webhook signature", {
        receivedChecksum,
      });
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Only process transaction.updated events
    if (event.event !== "transaction.updated") {
      await db
        .update(webhookEvents)
        .set({ processed: true, processedAt: new Date() })
        .where(eq(webhookEvents.id, webhookLog.id));

      return NextResponse.json({ received: true });
    }

    const { transaction } = event.data;

    // Find payment by reference
    const [payment] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.wompiReference, transaction.reference))
      .limit(1);

    if (!payment) {
      await db
        .update(webhookEvents)
        .set({
          processed: true,
          processedAt: new Date(),
          errorMessage: "Payment not found in database",
        })
        .where(eq(webhookEvents.id, webhookLog.id));

      return NextResponse.json({ received: true, error: "Payment not found" });
    }

    // Map WOMPI status to our status
    const statusMap: Record<string, string> = {
      APPROVED: "approved",
      DECLINED: "declined",
      VOIDED: "voided",
      ERROR: "error",
    };

    const newStatus = statusMap[transaction.status] || "error";

    // Update payment transaction
    await db
      .update(paymentTransactions)
      .set({
        wompiTransactionId: transaction.id,
        status: newStatus as any,
        paymentMethod: transaction.payment_method?.type?.toLowerCase() as any,
        paidAt:
          transaction.status === "APPROVED"
            ? new Date(transaction.finalized_at!)
            : null,
        voidedAt: transaction.status === "VOIDED" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(paymentTransactions.id, payment.id));

    // Update lease approval fee if approved
    if (transaction.status === "APPROVED") {
      const [approvalFee] = await db
        .select()
        .from(leaseApprovalFees)
        .where(eq(leaseApprovalFees.paymentTransactionId, payment.id))
        .limit(1);

      if (approvalFee) {
        await db
          .update(leaseApprovalFees)
          .set({
            isPaid: true,
            paidAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(leaseApprovalFees.id, approvalFee.id));
      }
    }

    // Mark webhook as processed
    await db
      .update(webhookEvents)
      .set({
        processed: true,
        processedAt: new Date(),
        paymentTransactionId: payment.id,
      })
      .where(eq(webhookEvents.id, webhookLog.id));

    return NextResponse.json({ received: true, processed: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// WOMPI doesn't verify GET requests, but we can provide a health check
export async function GET() {
  return NextResponse.json({
    service: "WOMPI Webhook Handler",
    status: "active",
  });
}
