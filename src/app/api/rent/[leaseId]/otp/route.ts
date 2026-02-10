import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leases, otpCodes } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { generateOtp, getOtpExpiryDate } from "@/lib/utils/otp";

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

    // Verificar si ya existe un OTP valido
    const existingOtp = await db.query.otpCodes.findFirst({
      where: and(
        eq(otpCodes.leaseId, leaseId),
        eq(otpCodes.userId, session.user.id),
        gt(otpCodes.expiresAt, new Date())
      ),
    });

    if (existingOtp && !existingOtp.usedAt) {
      return NextResponse.json({
        message: "Ya tienes un codigo OTP activo",
        expiresAt: existingOtp.expiresAt,
      });
    }

    // Generar nuevo OTP
    const code = generateOtp();
    const expiresAt = getOtpExpiryDate();

    await db.insert(otpCodes).values({
      userId: session.user.id,
      leaseId,
      code,
      expiresAt,
    });

    // En produccion, aqui se enviaria el OTP por SMS o email
    // Por ahora, solo lo devolvemos en desarrollo
    const isDev = process.env.NODE_ENV === "development" || process.env.TEST_OTP_ENABLED === "true";

    return NextResponse.json({
      message: isDev
        ? `Codigo OTP generado: ${code} (solo visible en desarrollo)`
        : "Se ha enviado un codigo de verificacion a tu telefono/email",
      expiresAt,
      ...(isDev && { code }),
    });
  } catch (error) {
    console.error("Generate OTP error:", error);
    return NextResponse.json(
      { error: "Error al generar el codigo OTP" },
      { status: 500 }
    );
  }
}
