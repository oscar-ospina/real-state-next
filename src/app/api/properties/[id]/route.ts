import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updatePropertySchema = z.object({
  title: z.string().min(5),
  description: z.string().optional(),
  propertyType: z.enum(["apartment", "house", "room", "studio", "commercial"]),
  price: z.string(),
  currency: z.string().default("COP"),
  address: z.string().min(5),
  city: z.string().min(2),
  neighborhood: z.string().optional(),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(1),
  areaSqm: z.string().optional(),
  isFurnished: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
});

// GET - Obtener una propiedad por ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, id),
      with: {
        images: true,
        owner: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Propiedad no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error("Get property error:", error);
    return NextResponse.json(
      { error: "Error al obtener la propiedad" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar una propiedad
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Verificar que la propiedad existe y pertenece al usuario
    const existingProperty = await db.query.properties.findFirst({
      where: eq(properties.id, id),
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Propiedad no encontrada" },
        { status: 404 }
      );
    }

    // Solo el dueño o admin puede editar
    const isOwner = existingProperty.ownerId === session.user.id;
    const isAdmin = session.user.roles?.includes("admin");

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "No tienes permiso para editar esta propiedad" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = updatePropertySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos invalidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [updatedProperty] = await db
      .update(properties)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, id))
      .returning();

    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error("Update property error:", error);
    return NextResponse.json(
      { error: "Error al actualizar la propiedad" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una propiedad
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Verificar que la propiedad existe y pertenece al usuario
    const existingProperty = await db.query.properties.findFirst({
      where: eq(properties.id, id),
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Propiedad no encontrada" },
        { status: 404 }
      );
    }

    // Solo el dueño o admin puede eliminar
    const isOwner = existingProperty.ownerId === session.user.id;
    const isAdmin = session.user.roles?.includes("admin");

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar esta propiedad" },
        { status: 403 }
      );
    }

    await db.delete(properties).where(eq(properties.id, id));

    return NextResponse.json({ message: "Propiedad eliminada" });
  } catch (error) {
    console.error("Delete property error:", error);
    return NextResponse.json(
      { error: "Error al eliminar la propiedad" },
      { status: 500 }
    );
  }
}
