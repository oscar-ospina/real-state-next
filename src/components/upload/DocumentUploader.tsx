"use client";

import { CheckCircle2, FileText } from "lucide-react";
import { FileUploader } from "./FileUploader";
import { cn } from "@/lib/utils";
import {
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE,
} from "@/lib/services/upload-constants";
import {
  formatDocumentLabel,
  getRequiredPropertyDocuments,
} from "@/lib/properties/review-requirements";

interface DocumentRequirement {
  type: string;
  label: string;
  description: string;
  required: boolean;
}

interface UploadedDocument {
  documentType: string;
  url: string;
  fileName: string;
  sizeBytes?: number;
}

interface DocumentUploaderProps {
  publisherRole: "owner" | "mandatario";
  isHorizontalProperty: boolean;
  propertyId: string;
  uploadedDocuments: UploadedDocument[];
  onDocumentUploaded: (doc: UploadedDocument) => void;
  className?: string;
}

const DOCUMENT_DESCRIPTIONS: Record<string, string> = {
  escritura_publica: "Documento que acredita la propiedad del inmueble.",
  certificado_tradicion: "Documento expedido por la Oficina de Registro.",
  contrato_mandato:
    "Contrato que autoriza al mandatario a administrar el inmueble.",
  reglamento_propiedad_horizontal:
    "Copia del reglamento de la copropiedad.",
  paz_y_salvo_admin:
    "Certificado de estar al día con la administración.",
};

export function DocumentUploader({
  publisherRole,
  isHorizontalProperty,
  propertyId,
  uploadedDocuments,
  onDocumentUploaded,
  className,
}: DocumentUploaderProps) {
  const requirements: DocumentRequirement[] = getRequiredPropertyDocuments({
    publisherRole,
    isHorizontalProperty,
  }).map((type) => ({
    type,
    label: formatDocumentLabel(type),
    description: DOCUMENT_DESCRIPTIONS[type],
    required: true,
  }));

  const isDocUploaded = (docType: string) =>
    uploadedDocuments.some((d) => d.documentType === docType);

  const allRequiredUploaded = requirements
    .filter((r) => r.required)
    .every((r) => isDocUploaded(r.type));

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Documentos de Verificacion</h3>
        {allRequiredUploaded ? (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 className="size-3" />
            Completo
          </span>
        ) : (
          <span className="text-xs text-amber-600">
            Documentos pendientes
          </span>
        )}
      </div>

      <div className="space-y-3">
        {requirements.map((req) => {
          const uploaded = isDocUploaded(req.type);
          const uploadedDoc = uploadedDocuments.find(
            (d) => d.documentType === req.type
          );

          return (
            <div
              key={req.type}
              className={cn(
                "rounded-lg border p-4 transition-all duration-200",
                uploaded ? "border-green-200 bg-green-50" : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {uploaded ? (
                      <CheckCircle2 className="size-4 text-green-500" />
                    ) : (
                      <FileText className="size-4 text-gray-400" />
                    )}
                    <p className="text-sm font-medium">
                      {req.label}
                      {req.required && (
                        <span className="ml-1 text-red-500">*</span>
                      )}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {req.description}
                  </p>
                  {uploadedDoc && (
                    <p className="mt-1 text-xs text-green-600">
                      {uploadedDoc.fileName}
                    </p>
                  )}
                </div>
              </div>

              {!uploaded && (
                <div className="mt-3">
                  <FileUploader
                    allowedTypes={ALLOWED_DOCUMENT_TYPES}
                    maxSize={MAX_DOCUMENT_SIZE}
                    maxFiles={1}
                    folder="documents"
                    entityId={propertyId}
                    label="Subir documento (PDF, JPG, PNG)"
                    description="Maximo 20MB"
                    onUploadComplete={(url, metadata) => {
                      onDocumentUploaded({
                        documentType: req.type,
                        url,
                        fileName: metadata.fileName,
                        sizeBytes: metadata.sizeBytes,
                      });
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
