import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leases, tenantProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateLeaseContract } from "@/lib/templates/lease-contract";

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
        property: true,
        tenant: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        landlord: {
          columns: {
            id: true,
            name: true,
            email: true,
            phone: true,
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

    if (
      lease.tenantId !== session.user.id &&
      lease.landlordId !== session.user.id &&
      !session.user.roles?.includes("admin")
    ) {
      return NextResponse.json(
        { error: "No tienes permiso para ver este contrato" },
        { status: 403 }
      );
    }

    const tenantProfile = await db.query.tenantProfiles.findFirst({
      where: eq(tenantProfiles.userId, lease.tenantId),
    });

    if (!tenantProfile) {
      return NextResponse.json(
        { error: "El perfil del arrendatario no esta completo" },
        { status: 400 }
      );
    }

    const contractHtml = generateLeaseContract({
      property: lease.property,
      landlord: lease.landlord,
      tenant: lease.tenant,
      tenantProfile,
      lease,
    });

    return NextResponse.json({ contractHtml });
  } catch (error) {
    console.error("Get contract error:", error);
    return NextResponse.json(
      { error: "Error al generar el contrato" },
      { status: 500 }
    );
  }
}

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
      with: {
        property: true,
        tenant: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        landlord: {
          columns: {
            id: true,
            name: true,
            email: true,
            phone: true,
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

    if (lease.tenantId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para modificar este contrato" },
        { status: 403 }
      );
    }

    if (lease.status !== "draft" || lease.currentStep !== 3) {
      return NextResponse.json(
        { error: "Este paso ya fue completado o no es valido" },
        { status: 400 }
      );
    }

    const tenantProfile = await db.query.tenantProfiles.findFirst({
      where: eq(tenantProfiles.userId, lease.tenantId),
    });

    if (!tenantProfile) {
      return NextResponse.json(
        { error: "El perfil del arrendatario no esta completo" },
        { status: 400 }
      );
    }

    // Generar y guardar el contrato
    const contractHtml = generateLeaseContract({
      property: lease.property,
      landlord: lease.landlord,
      tenant: lease.tenant,
      tenantProfile,
      lease,
    });

    // Avanzar al paso 4 y guardar contrato
    const [updatedLease] = await db
      .update(leases)
      .set({
        currentStep: 4,
        status: "pending_signature",
        contractContent: contractHtml,
        updatedAt: new Date(),
      })
      .where(eq(leases.id, leaseId))
      .returning();

    return NextResponse.json(updatedLease);
  } catch (error) {
    console.error("Save contract error:", error);
    return NextResponse.json(
      { error: "Error al guardar el contrato" },
      { status: 500 }
    );
  }
}
