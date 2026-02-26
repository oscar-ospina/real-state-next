import { z } from "zod";

export const signedUrlSchema = z.object({
  fileName: z.string().min(1, "Nombre de archivo requerido"),
  contentType: z.string().min(1, "Tipo de contenido requerido"),
  folder: z.enum(["properties", "documents", "user-documents"]),
  entityId: z.string().uuid("ID de entidad invalido"),
});

export const propertyMediaSchema = z.object({
  url: z.string().url("URL invalida"),
  mediaType: z.enum(["image", "video"]),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  isPrimary: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

export const propertyDocumentSchema = z.object({
  url: z.string().url("URL invalida"),
  documentType: z.enum([
    "escritura_publica",
    "certificado_tradicion",
    "contrato_mandato",
    "reglamento_propiedad_horizontal",
    "paz_y_salvo_admin",
  ]),
  fileName: z.string().min(1),
  sizeBytes: z.number().int().positive().optional(),
});

export const userDocumentSchema = z.object({
  url: z.string().url("URL invalida"),
  documentType: z.enum(["cedula_front", "cedula_back"]),
  fileName: z.string().min(1),
  sizeBytes: z.number().int().positive().optional(),
});

export type SignedUrlInput = z.infer<typeof signedUrlSchema>;
export type PropertyMediaInput = z.infer<typeof propertyMediaSchema>;
export type PropertyDocumentInput = z.infer<typeof propertyDocumentSchema>;
export type UserDocumentInput = z.infer<typeof userDocumentSchema>;
