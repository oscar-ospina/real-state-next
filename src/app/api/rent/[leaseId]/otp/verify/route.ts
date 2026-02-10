import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leases, otpCodes } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { verifyOtpSchema } from "@/lib/validations/rent";
import { isOtpExpired, createSignatureHash } from "@/lib/utils/otp";

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
    const body = await req.json();
    const parsed = verifyOtpSchema.safeParse({ ...body, leaseId });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos invalidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const lease = await db.query.leases.findFirst({
      where: eq(leases.id, leaseId),
    });

    if (!lease) {
      return NextResponse.json(
        { error: "Contrato no encontrado" },
        { status: 404 }
      );
    }

    if (lease.tenantId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para firmar este contrato" },
        { status: 403 }
      );
    }

    if (lease.status !== "pending_signature" || lease.currentStep !== 4) {
      return NextResponse.json(
        { error: "El contrato no esta listo para firmar" },
        { status: 400 }
      );
    }

    // Buscar OTP valido
    const otpRecord = await db.query.otpCodes.findFirst({
      where: and(
        eq(otpCodes.leaseId, leaseId),
        eq(otpCodes.userId, session.user.id),
        eq(otpCodes.code, parsed.data.code),
        isNull(otpCodes.usedAt)
      ),
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Codigo OTP invalido" },
        { status: 400 }
      );
    }

    if (isOtpExpired(otpRecord.expiresAt)) {
      return NextResponse.json(
        { error: "El codigo OTP ha expirado" },
        { status: 400 }
      );
    }

    // Marcar OTP como usado
    const signedAt = new Date();
    await db
      .update(otpCodes)
      .set({ usedAt: signedAt })
      .where(eq(otpCodes.id, otpRecord.id));

    // Crear hash de firma
    const signatureHash = createSignatureHash(
      otpRecord.code,
      leaseId,
      session.user.id,
      signedAt
    );

    // Actualizar lease: firmado por tenant, pendiente de aprobacion del landlord
    const [updatedLease] = await db
      .update(leases)
      .set({
        currentStep: 5,
        status: "pending_landlord_approval",
        tenantSignedAt: signedAt,
        tenantSignatureHash: signatureHash,
        updatedAt: new Date(),
      })
      .where(eq(leases.id, leaseId))
      .returning();

    return NextResponse.json({
      message: "Contrato firmado exitosamente",
      lease: updatedLease,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Error al verificar el codigo OTP" },
      { status: 500 }
    );
  }
}
