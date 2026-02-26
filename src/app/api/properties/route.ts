import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createPropertySchema = z.object({
  title: z.string().min(5),
  description: z.string().optional(),
  propertyType: z.enum(["apartment", "house", "room", "studio", "commercial"]),
  price: z.string(),
  currency: z.string().default("COP"),
  address: z.string().min(5),
  city: z.string().min(2),
  neighborhood: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(1),
  areaSqm: z.string().optional(),
  isFurnished: z.boolean().default(false),
  publisherRole: z.enum(["owner", "mandatario"]).default("owner"),
  isNegotiable: z.boolean().default(false),
  minPrice: z.string().optional(),
  isHorizontalProperty: z.boolean().default(false),
});

export async function GET() {
  // Solo mostrar propiedades aprobadas al publico
  const allProperties = await db.query.properties.findMany({
    where: eq(properties.status, "approved"),
    with: {
      images: true,
      owner: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: (properties, { desc }) => [desc(properties.createdAt)],
  });

  return NextResponse.json(allProperties);
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!session.user.roles?.includes("landlord")) {
    return NextResponse.json(
      { error: "Debes ser arrendador para publicar propiedades" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const parsed = createPropertySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Auto-determine contract type based on property type
    const contractType =
      parsed.data.propertyType === "commercial"
        ? "comercial"
        : "vivienda_urbana";

    const [newProperty] = await db
      .insert(properties)
      .values({
        ...parsed.data,
        ownerId: session.user.id,
        status: "draft",
        contractType,
      })
      .returning();

    return NextResponse.json(newProperty, { status: 201 });
  } catch (error) {
    console.error("Create property error:", error);
    return NextResponse.json(
      { error: "Error al crear la propiedad" },
      { status: 500 }
    );
  }
}
