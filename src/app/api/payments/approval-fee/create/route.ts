import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  leases,
  paymentTransactions,
  leaseApprovalFees,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createPaymentSchema } from "@/lib/validations/payment";
import {
  generatePaymentReference,
  generateWompiIntegritySignature,
  calculateApprovalFee,
  copToCents,
  buildCheckoutUrl,
  formatCOP,
} from "@/lib/utils/wompi";
import { wompiConfig } from "@/lib/config/wompi";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { leaseId } = parsed.data;

    // Fetch lease with payment status
    const lease = await db.query.leases.findFirst({
      where: eq(leases.id, leaseId),
      with: {
        approvalFee: {
          with: {
            payment: true,
          },
        },
      },
    });

    if (!lease) {
      return NextResponse.json(
        { error: "Contrato no encontrado" },
        { status: 404 }
      );
    }

    // Verify user is the landlord
    if (lease.landlordId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para este contrato" },
        { status: 403 }
      );
    }

    // Check if lease is in correct status
    if (lease.status !== "pending_landlord_approval") {
      return NextResponse.json(
        { error: "El contrato no está pendiente de aprobación" },
        { status: 400 }
      );
    }

    // Check if payment already exists and is approved
    if (lease.approvalFee?.isPaid) {
      return NextResponse.json(
        { error: "Este contrato ya tiene el pago de aprobación realizado" },
        { status: 400 }
      );
    }

    // If payment exists but is pending, return existing checkout URL
    if (
      lease.approvalFee &&
      lease.approvalFee.payment.status === "pending"
    ) {
      return NextResponse.json({
        checkoutUrl: lease.approvalFee.payment.wompiCheckoutUrl,
        paymentId: lease.approvalFee.payment.id,
        reference: lease.approvalFee.payment.wompiReference,
        amount: lease.approvalFee.feeAmount,
        amountFormatted: formatCOP(lease.approvalFee.feeAmount),
      });
    }

    // Calculate fee
    const feeAmount = calculateApprovalFee(lease.monthlyRent);
    const amountInCents = copToCents(feeAmount);

    // Generate reference and signature
    const reference = generatePaymentReference(leaseId);
    const integritySignature = generateWompiIntegritySignature(
      reference,
      amountInCents,
      "COP"
    );

    // Create payment transaction
    const [payment] = await db
      .insert(paymentTransactions)
      .values({
        wompiReference: reference,
        amount: feeAmount.toString(),
        currency: "COP",
        status: "pending",
        userId: session.user.id,
        wompiCheckoutUrl: buildCheckoutUrl(reference),
        integritySignature,
        metadata: JSON.stringify({
          leaseId,
          userEmail: session.user.email,
          purpose: "approval_fee",
        }),
      })
      .returning();

    // Create lease approval fee record
    await db.insert(leaseApprovalFees).values({
      leaseId,
      paymentTransactionId: payment.id,
      monthlyRent: lease.monthlyRent,
      feePercentage: wompiConfig.approvalFeePercentage.toString(),
      feeAmount: feeAmount.toString(),
      isPaid: false,
    });

    return NextResponse.json({
      checkoutUrl: payment.wompiCheckoutUrl,
      paymentId: payment.id,
      reference: payment.wompiReference,
      amount: feeAmount,
      amountFormatted: formatCOP(feeAmount),
    });
  } catch (error) {
    console.error("Create approval fee payment error:", error);
    return NextResponse.json(
      { error: "Error al crear el pago" },
      { status: 500 }
    );
  }
}
