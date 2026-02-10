import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leases, properties } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createLeaseSchema } from "@/lib/validations/rent";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!session.user.roles?.includes("tenant")) {
    return NextResponse.json(
      { error: "Debes tener rol de arrendatario" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const parsed = createLeaseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos invalidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const property = await db.query.properties.findFirst({
      where: eq(properties.id, parsed.data.propertyId),
    });

    if (!property) {
      return NextResponse.json(
        { error: "Propiedad no encontrada" },
        { status: 404 }
      );
    }

    if (!property.isAvailable) {
      return NextResponse.json(
        { error: "La propiedad no esta disponible" },
        { status: 400 }
      );
    }

    if (property.ownerId === session.user.id) {
      return NextResponse.json(
        { error: "No puedes arrendar tu propia propiedad" },
        { status: 400 }
      );
    }

    // Verificar si ya existe un lease activo para esta propiedad y tenant
    const existingLease = await db.query.leases.findFirst({
      where: and(
        eq(leases.propertyId, property.id),
        eq(leases.tenantId, session.user.id)
      ),
    });

    if (
      existingLease &&
      !["rejected", "cancelled", "completed"].includes(existingLease.status)
    ) {
      return NextResponse.json(
        {
          error: "Ya tienes un proceso de arrendamiento activo para esta propiedad",
          leaseId: existingLease.id,
        },
        { status: 400 }
      );
    }

    const [newLease] = await db
      .insert(leases)
      .values({
        propertyId: property.id,
        tenantId: session.user.id,
        landlordId: property.ownerId,
        monthlyRent: property.price,
        currency: property.currency,
        depositAmount: property.price,
        status: "draft",
        currentStep: 1,
      })
      .returning();

    return NextResponse.json(newLease, { status: 201 });
  } catch (error) {
    console.error("Create lease error:", error);
    return NextResponse.json(
      { error: "Error al iniciar proceso de arrendamiento" },
      { status: 500 }
    );
  }
}
