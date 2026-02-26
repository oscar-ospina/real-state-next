import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties, propertyDocuments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { propertyDocumentSchema } from "@/lib/validations/upload";
import { deleteFile } from "@/lib/services/gcs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Only owner or admin can see documents
  const property = await db.query.properties.findFirst({
    where: eq(properties.id, id),
  });

  if (!property) {
    return NextResponse.json(
      { error: "Propiedad no encontrada" },
      { status: 404 }
    );
  }

  if (
    property.ownerId !== session.user.id &&
    !session.user.roles?.includes("admin")
  ) {
    return NextResponse.json(
      { error: "No tienes permiso" },
      { status: 403 }
    );
  }

  const documents = await db.query.propertyDocuments.findMany({
    where: eq(propertyDocuments.propertyId, id),
  });

  return NextResponse.json(documents);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const property = await db.query.properties.findFirst({
    where: eq(properties.id, id),
  });

  if (!property) {
    return NextResponse.json(
      { error: "Propiedad no encontrada" },
      { status: 404 }
    );
  }

  if (
    property.ownerId !== session.user.id &&
    !session.user.roles?.includes("admin")
  ) {
    return NextResponse.json(
      { error: "No tienes permiso para modificar esta propiedad" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const parsed = propertyDocumentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos invalidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [newDoc] = await db
      .insert(propertyDocuments)
      .values({
        propertyId: id,
        documentType: parsed.data.documentType,
        url: parsed.data.url,
        fileName: parsed.data.fileName,
        sizeBytes: parsed.data.sizeBytes,
      })
      .returning();

    return NextResponse.json(newDoc, { status: 201 });
  } catch (error) {
    console.error("Create document error:", error);
    return NextResponse.json(
      { error: "Error al registrar el documento" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { documentId } = await req.json();

    const doc = await db.query.propertyDocuments.findFirst({
      where: and(
        eq(propertyDocuments.id, documentId),
        eq(propertyDocuments.propertyId, id)
      ),
    });

    if (!doc) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    const property = await db.query.properties.findFirst({
      where: eq(properties.id, id),
    });

    if (
      property?.ownerId !== session.user.id &&
      !session.user.roles?.includes("admin")
    ) {
      return NextResponse.json(
        { error: "No tienes permiso" },
        { status: 403 }
      );
    }

    // Delete from GCS
    const bucketName = process.env.GCS_BUCKET_NAME;
    const prefix = `https://storage.googleapis.com/${bucketName}/`;
    if (doc.url.startsWith(prefix)) {
      const filePath = doc.url.slice(prefix.length);
      await deleteFile(filePath);
    }

    await db
      .delete(propertyDocuments)
      .where(eq(propertyDocuments.id, documentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      { error: "Error al eliminar el documento" },
      { status: 500 }
    );
  }
}
