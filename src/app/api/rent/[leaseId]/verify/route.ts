import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leases, tenantProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { tenantVerificationSchema } from "@/lib/validations/rent";

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
        { error: "No tienes permiso para modificar este contrato" },
        { status: 403 }
      );
    }

    if (lease.status !== "draft" || lease.currentStep !== 2) {
      return NextResponse.json(
        { error: "Este paso ya fue completado o no es valido" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = tenantVerificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos invalidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verificar si ya existe un perfil de tenant
    const existingProfile = await db.query.tenantProfiles.findFirst({
      where: eq(tenantProfiles.userId, session.user.id),
    });

    if (existingProfile) {
      // Actualizar perfil existente
      await db
        .update(tenantProfiles)
        .set({
          documentType: parsed.data.documentType,
          documentNumber: parsed.data.documentNumber,
          occupation: parsed.data.occupation,
          monthlyIncome: parsed.data.monthlyIncome,
          referenceName: parsed.data.referenceName,
          referencePhone: parsed.data.referencePhone,
          referenceRelation: parsed.data.referenceRelation,
          updatedAt: new Date(),
        })
        .where(eq(tenantProfiles.userId, session.user.id));
    } else {
      // Crear nuevo perfil
      await db.insert(tenantProfiles).values({
        userId: session.user.id,
        documentType: parsed.data.documentType,
        documentNumber: parsed.data.documentNumber,
        occupation: parsed.data.occupation,
        monthlyIncome: parsed.data.monthlyIncome,
        referenceName: parsed.data.referenceName,
        referencePhone: parsed.data.referencePhone,
        referenceRelation: parsed.data.referenceRelation,
      });
    }

    // Avanzar al paso 3
    const [updatedLease] = await db
      .update(leases)
      .set({
        currentStep: 3,
        updatedAt: new Date(),
      })
      .where(eq(leases.id, leaseId))
      .returning();

    return NextResponse.json(updatedLease);
  } catch (error) {
    console.error("Verify tenant error:", error);
    return NextResponse.json(
      { error: "Error al guardar la verificacion" },
      { status: 500 }
    );
  }
}
