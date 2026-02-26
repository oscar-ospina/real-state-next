import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userDocuments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { deleteFile } from "@/lib/services/gcs";

// GET: obtener documentos del usuario actual
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const docs = await db.query.userDocuments.findMany({
      where: eq(userDocuments.userId, session.user.id),
      orderBy: (userDocuments, { asc }) => [asc(userDocuments.createdAt)],
    });

    return NextResponse.json(docs);
  } catch (error) {
    console.error("Get user documents error:", error);
    return NextResponse.json(
      { error: "Error al obtener documentos" },
      { status: 500 }
    );
  }
}

// POST: agregar documento de identidad
export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { documentType, url, fileName, sizeBytes } = body;

    if (!documentType || !url || !fileName) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Validar tipo de documento
    const validTypes = ["cedula_front", "cedula_back"];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: "Tipo de documento inválido" },
        { status: 400 }
      );
    }

    // Verificar si ya existe un documento de este tipo
    const existing = await db.query.userDocuments.findFirst({
      where: and(
        eq(userDocuments.userId, session.user.id),
        eq(userDocuments.documentType, documentType)
      ),
    });

    // Si existe, eliminarlo primero (del DB y del storage)
    if (existing) {
      await deleteFile(existing.url);
      await db
        .delete(userDocuments)
        .where(eq(userDocuments.id, existing.id));
    }

    // Crear nuevo documento
    const [newDoc] = await db
      .insert(userDocuments)
      .values({
        userId: session.user.id,
        documentType,
        url,
        fileName,
        sizeBytes: sizeBytes || null,
      })
      .returning();

    return NextResponse.json(newDoc, { status: 201 });
  } catch (error) {
    console.error("Create user document error:", error);
    return NextResponse.json(
      { error: "Error al crear documento" },
      { status: 500 }
    );
  }
}

// DELETE: eliminar documento
export async function DELETE(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("id");

    if (!documentId) {
      return NextResponse.json(
        { error: "ID de documento requerido" },
        { status: 400 }
      );
    }

    // Verificar que el documento pertenece al usuario
    const doc = await db.query.userDocuments.findFirst({
      where: and(
        eq(userDocuments.id, documentId),
        eq(userDocuments.userId, session.user.id)
      ),
    });

    if (!doc) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar del storage
    await deleteFile(doc.url);

    // Eliminar del DB
    await db.delete(userDocuments).where(eq(userDocuments.id, documentId));

    return NextResponse.json({ message: "Documento eliminado" });
  } catch (error) {
    console.error("Delete user document error:", error);
    return NextResponse.json(
      { error: "Error al eliminar documento" },
      { status: 500 }
    );
  }
}
