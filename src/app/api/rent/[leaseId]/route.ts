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
        property: {
          with: {
            images: true,
          },
        },
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

    // Solo el tenant o landlord pueden ver el lease
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

    return NextResponse.json(lease);
  } catch (error) {
    console.error("Get lease error:", error);
    return NextResponse.json(
      { error: "Error al obtener el contrato" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await req.json();

    const [updatedLease] = await db
      .update(leases)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(leases.id, leaseId))
      .returning();

    return NextResponse.json(updatedLease);
  } catch (error) {
    console.error("Update lease error:", error);
    return NextResponse.json(
      { error: "Error al actualizar el contrato" },
      { status: 500 }
    );
  }
}
