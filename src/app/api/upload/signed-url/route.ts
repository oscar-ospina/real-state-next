import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { signedUrlSchema } from "@/lib/validations/upload";
import {
  generateUploadSignedUrl,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  ALLOWED_DOCUMENT_TYPES,
} from "@/lib/services/gcs";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = signedUrlSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos invalidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { fileName, contentType, folder, entityId } = parsed.data;

    // Validate content type based on folder
    const allowedTypes =
      folder === "properties"
        ? [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]
        : folder === "documents"
          ? ALLOWED_DOCUMENT_TYPES
          : [...ALLOWED_IMAGE_TYPES]; // user-documents: only images

    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: `Tipo de archivo no permitido: ${contentType}` },
        { status: 400 }
      );
    }

    // Role checks
    if (folder === "properties" || folder === "documents") {
      if (!session.user.roles?.includes("landlord")) {
        return NextResponse.json(
          { error: "Debes ser arrendador para subir archivos de propiedades" },
          { status: 403 }
        );
      }
    }

    const result = await generateUploadSignedUrl({
      fileName,
      contentType,
      folder,
      entityId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Signed URL error:", error);
    return NextResponse.json(
      { error: "Error al generar URL de carga" },
      { status: 500 }
    );
  }
}
