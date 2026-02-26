import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
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
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, id),
      with: {
        documents: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Propiedad no encontrada" },
        { status: 404 }
      );
    }

    // Solo el dueño puede enviar a revision
    if (property.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para enviar esta propiedad a revision" },
        { status: 403 }
      );
    }

    // Solo se pueden enviar propiedades en estado draft o rejected
    if (property.status !== "draft" && property.status !== "rejected") {
      return NextResponse.json(
        { error: `No se puede enviar una propiedad en estado ${property.status}` },
        { status: 400 }
      );
    }

    // Validar documentos requeridos
    const requiredDocs: string[] = ["escritura_publica", "certificado_tradicion"];

    if (property.publisherRole === "mandatario") {
      requiredDocs.push("contrato_mandato");
    }

    if (property.isHorizontalProperty) {
      requiredDocs.push("reglamento_propiedad_horizontal", "paz_y_salvo_admin");
    }

    const uploadedDocs = property.documents.map((d) => d.documentType as string);
    const missingDocs = requiredDocs.filter(
      (doc) => !uploadedDocs.includes(doc)
    );

    if (missingDocs.length > 0) {
      return NextResponse.json(
        {
          error: "Faltan documentos requeridos",
          missingDocuments: missingDocs,
        },
        { status: 400 }
      );
    }

    // Actualizar estado a pending_review
    const [updatedProperty] = await db
      .update(properties)
      .set({
        status: "pending_review",
        updatedAt: new Date(),
      })
      .where(eq(properties.id, id))
      .returning();

    return NextResponse.json({
      message: "Propiedad enviada a revision exitosamente",
      property: updatedProperty,
    });
  } catch (error) {
    console.error("Submit property error:", error);
    return NextResponse.json(
      { error: "Error al enviar la propiedad a revision" },
      { status: 500 }
    );
  }
}
