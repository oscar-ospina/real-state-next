export type PublisherRole = "owner" | "mandatario";
export type PropertyDocumentType =
  | "escritura_publica"
  | "certificado_tradicion"
  | "contrato_mandato"
  | "reglamento_propiedad_horizontal"
  | "paz_y_salvo_admin";

export interface PropertyVerificationContext {
  publisherRole: PublisherRole;
  isHorizontalProperty: boolean;
}

export interface PropertyReviewReadiness {
  requiredDocuments: PropertyDocumentType[];
  missingDocuments: PropertyDocumentType[];
  hasMinimumMedia: boolean;
  canSubmitForReview: boolean;
}

export const propertyDocumentLabels: Record<PropertyDocumentType, string> = {
  escritura_publica: "Escritura pública",
  certificado_tradicion: "Certificado de tradición y libertad",
  contrato_mandato: "Contrato de mandato",
  reglamento_propiedad_horizontal: "Reglamento de propiedad horizontal",
  paz_y_salvo_admin: "Paz y salvo de administración",
};

export function getRequiredPropertyDocuments({
  publisherRole,
  isHorizontalProperty,
}: PropertyVerificationContext): PropertyDocumentType[] {
  const requiredDocuments: PropertyDocumentType[] = [
    "escritura_publica",
    "certificado_tradicion",
  ];

  if (publisherRole === "mandatario") {
    requiredDocuments.push("contrato_mandato");
  }

  if (isHorizontalProperty) {
    requiredDocuments.push(
      "reglamento_propiedad_horizontal",
      "paz_y_salvo_admin",
    );
  }

  return requiredDocuments;
}

export function getPropertyReviewReadiness(args: {
  publisherRole: PublisherRole;
  isHorizontalProperty: boolean;
  uploadedDocumentTypes: string[];
  mediaTypes?: Array<"image" | "video">;
}): PropertyReviewReadiness {
  const requiredDocuments = getRequiredPropertyDocuments({
    publisherRole: args.publisherRole,
    isHorizontalProperty: args.isHorizontalProperty,
  });

  const missingDocuments = requiredDocuments.filter(
    (doc) => !args.uploadedDocumentTypes.includes(doc),
  );

  const hasMinimumMedia = (args.mediaTypes || []).includes("image");

  return {
    requiredDocuments,
    missingDocuments,
    hasMinimumMedia,
    canSubmitForReview: missingDocuments.length === 0 && hasMinimumMedia,
  };
}

export function formatDocumentLabel(documentType: string) {
  return propertyDocumentLabels[documentType as PropertyDocumentType] || documentType;
}
