"use client";

import { CheckCircle2, FileText } from "lucide-react";
import { FileUploader } from "./FileUploader";
import { cn } from "@/lib/utils";
import {
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE,
} from "@/lib/services/upload-constants";

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

const BASE_REQUIREMENTS: DocumentRequirement[] = [
  {
    type: "escritura_publica",
    label: "Escritura Publica",
    description: "Documento que acredita la propiedad del inmueble",
    required: true,
  },
  {
    type: "certificado_tradicion",
    label: "Certificado de Tradicion y Libertad",
    description: "Documento expedido por la Oficina de Registro",
    required: true,
  },
];

const MANDATARIO_REQUIREMENTS: DocumentRequirement[] = [
  {
    type: "contrato_mandato",
    label: "Contrato de Mandato",
    description: "Contrato que autoriza al mandatario a administrar el inmueble",
    required: true,
  },
];

const HORIZONTAL_PROPERTY_REQUIREMENTS: DocumentRequirement[] = [
  {
    type: "reglamento_propiedad_horizontal",
    label: "Reglamento de Propiedad Horizontal",
    description: "Copia del reglamento de la copropiedad",
    required: true,
  },
  {
    type: "paz_y_salvo_admin",
    label: "Paz y Salvo de Administracion",
    description: "Certificado de estar al dia con la administracion",
    required: true,
  },
];

export function DocumentUploader({
  publisherRole,
  isHorizontalProperty,
  propertyId,
  uploadedDocuments,
  onDocumentUploaded,
  className,
}: DocumentUploaderProps) {
  const requirements = [
    ...BASE_REQUIREMENTS,
    ...(publisherRole === "mandatario" ? MANDATARIO_REQUIREMENTS : []),
    ...(isHorizontalProperty ? HORIZONTAL_PROPERTY_REQUIREMENTS : []),
  ];

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
