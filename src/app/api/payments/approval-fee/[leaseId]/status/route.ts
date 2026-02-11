import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leases } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
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

    // Verify user is landlord or tenant
    if (
      lease.landlordId !== session.user.id &&
      lease.tenantId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "No tienes permiso" },
        { status: 403 }
      );
    }

    if (!lease.approvalFee) {
      return NextResponse.json({
        isPaid: false,
        status: null,
        message: "No hay pago creado",
      });
    }

    return NextResponse.json({
      isPaid: lease.approvalFee.isPaid,
      status: lease.approvalFee.payment.status,
      amount: lease.approvalFee.feeAmount,
      paidAt: lease.approvalFee.paidAt,
      checkoutUrl: lease.approvalFee.payment.wompiCheckoutUrl,
      reference: lease.approvalFee.payment.wompiReference,
    });
  } catch (error) {
    console.error("Check payment status error:", error);
    return NextResponse.json(
      { error: "Error al verificar el pago" },
      { status: 500 }
    );
  }
}
