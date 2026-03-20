import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  formatDocumentLabel,
  getPropertyReviewReadiness,
} from "@/lib/properties/review-requirements";

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
        images: true,
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

    const reviewReadiness = getPropertyReviewReadiness({
      publisherRole: property.publisherRole,
      isHorizontalProperty: property.isHorizontalProperty,
      uploadedDocumentTypes: property.documents.map((d) => d.documentType),
      mediaTypes: property.images.map((image) => image.mediaType ?? "image"),
    });

    if (reviewReadiness.missingDocuments.length > 0 || !reviewReadiness.hasMinimumMedia) {
      return NextResponse.json(
        {
          error: "La propiedad no esta lista para revision",
          missingDocuments: reviewReadiness.missingDocuments,
          missingDocumentLabels: reviewReadiness.missingDocuments.map(formatDocumentLabel),
          missingRequirements: [
            ...reviewReadiness.missingDocuments.map(formatDocumentLabel),
            ...(!reviewReadiness.hasMinimumMedia ? ["Al menos una imagen de la propiedad"] : []),
          ],
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
