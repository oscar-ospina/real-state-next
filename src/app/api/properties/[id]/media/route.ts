import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties, propertyImages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { propertyMediaSchema } from "@/lib/validations/upload";
import { deleteFile } from "@/lib/services/gcs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const media = await db.query.propertyImages.findMany({
    where: eq(propertyImages.propertyId, id),
    orderBy: (images, { asc }) => [asc(images.order)],
  });

  return NextResponse.json(media);
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

  // Verify ownership
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
    const parsed = propertyMediaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos invalidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [newMedia] = await db
      .insert(propertyImages)
      .values({
        propertyId: id,
        url: parsed.data.url,
        mediaType: parsed.data.mediaType,
        mimeType: parsed.data.mimeType,
        sizeBytes: parsed.data.sizeBytes,
        isPrimary: parsed.data.isPrimary,
        order: parsed.data.order,
      })
      .returning();

    return NextResponse.json(newMedia, { status: 201 });
  } catch (error) {
    console.error("Create media error:", error);
    return NextResponse.json(
      { error: "Error al registrar el archivo" },
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
    const { mediaId } = await req.json();

    const media = await db.query.propertyImages.findFirst({
      where: and(
        eq(propertyImages.id, mediaId),
        eq(propertyImages.propertyId, id)
      ),
    });

    if (!media) {
      return NextResponse.json(
        { error: "Archivo no encontrado" },
        { status: 404 }
      );
    }

    // Verify ownership
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

    // Extract GCS file path from URL
    const bucketName = process.env.GCS_BUCKET_NAME;
    const prefix = `https://storage.googleapis.com/${bucketName}/`;
    if (media.url.startsWith(prefix)) {
      const filePath = media.url.slice(prefix.length);
      await deleteFile(filePath);
    }

    await db.delete(propertyImages).where(eq(propertyImages.id, mediaId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete media error:", error);
    return NextResponse.json(
      { error: "Error al eliminar el archivo" },
      { status: 500 }
    );
  }
}
