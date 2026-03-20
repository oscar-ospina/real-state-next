import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  formatDocumentLabel,
  getPropertyReviewReadiness,
} from "@/lib/properties/review-requirements";
import { z } from "zod";

const reviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!session.user.roles?.includes("admin")) {
    return NextResponse.json(
      { error: "Solo administradores pueden revisar propiedades" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos invalidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { action, rejectionReason } = parsed.data;

    // Verificar que la propiedad existe
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

    // Solo se pueden revisar propiedades en estado pending_review
    if (property.status !== "pending_review") {
      return NextResponse.json(
        { error: `No se puede revisar una propiedad en estado ${property.status}` },
        { status: 400 }
      );
    }

    // Validar que se proporcione razon si se rechaza
    if (action === "reject" && !rejectionReason?.trim()) {
      return NextResponse.json(
        { error: "Debes proporcionar un motivo de rechazo" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      const reviewReadiness = getPropertyReviewReadiness({
        publisherRole: property.publisherRole,
        isHorizontalProperty: property.isHorizontalProperty,
        uploadedDocumentTypes: property.documents.map((d) => d.documentType),
        mediaTypes: property.images.map((image) => image.mediaType ?? "image"),
      });

      if (!reviewReadiness.canSubmitForReview) {
        return NextResponse.json(
          {
            error: "La propiedad no cumple los requisitos minimos para aprobarse",
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
    }

    // Actualizar estado
    const newStatus = action === "approve" ? "approved" : "rejected";
    const [updatedProperty] = await db
      .update(properties)
      .set({
        status: newStatus,
        rejectionReason: action === "reject" ? rejectionReason : null,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, id))
      .returning();

    return NextResponse.json({
      message: `Propiedad ${action === "approve" ? "aprobada" : "rechazada"} exitosamente`,
      property: updatedProperty,
    });
  } catch (error) {
    console.error("Review property error:", error);
    return NextResponse.json(
      { error: "Error al revisar la propiedad" },
      { status: 500 }
    );
  }
}
