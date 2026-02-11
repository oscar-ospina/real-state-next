import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leases, leaseApprovalFees } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const respondSchema = z.object({
  action: z.enum(["approve", "reject"]),
  notes: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ leaseId: string }> }
) {
  const { leaseId } = await params;
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const lease = await db.query.leases.findFirst({
      where: eq(leases.id, leaseId),
    });

    if (!lease) {
      return NextResponse.json(
        { error: "Contrato no encontrado" },
        { status: 404 }
      );
    }

    // Solo el landlord puede responder
    if (lease.landlordId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para responder a esta solicitud" },
        { status: 403 }
      );
    }

    // Solo se puede responder a contratos pendientes de aprobación
    if (lease.status !== "pending_landlord_approval") {
      return NextResponse.json(
        { error: "Este contrato no esta pendiente de aprobacion" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = respondSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos invalidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check if payment is required and completed for approval
    if (parsed.data.action === "approve") {
      const approvalFee = await db.query.leaseApprovalFees.findFirst({
        where: eq(leaseApprovalFees.leaseId, leaseId),
        with: {
          payment: true,
        },
      });

      if (!approvalFee || !approvalFee.isPaid) {
        return NextResponse.json(
          {
            error:
              "Debes pagar la tarifa de aprobación antes de aprobar este contrato",
            requiresPayment: true,
          },
          { status: 402 } // Payment Required
        );
      }
    }

    const newStatus = parsed.data.action === "approve" ? "approved" : "rejected";

    const [updatedLease] = await db
      .update(leases)
      .set({
        status: newStatus,
        landlordRespondedAt: new Date(),
        landlordNotes: parsed.data.notes || null,
        updatedAt: new Date(),
      })
      .where(eq(leases.id, leaseId))
      .returning();

    return NextResponse.json({
      message:
        parsed.data.action === "approve"
          ? "Contrato aprobado exitosamente"
          : "Contrato rechazado",
      lease: updatedLease,
    });
  } catch (error) {
    console.error("Respond to lease error:", error);
    return NextResponse.json(
      { error: "Error al procesar la respuesta" },
      { status: 500 }
    );
  }
}
