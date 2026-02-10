import { z } from "zod";

// Schema para crear un nuevo lease
export const createLeaseSchema = z.object({
  propertyId: z.string().uuid("ID de propiedad invalido"),
});

// Schema para verificacion del tenant (paso 2)
export const tenantVerificationSchema = z.object({
  documentType: z.enum(["cc", "ce", "passport"], {
    message: "Selecciona un tipo de documento",
  }),
  documentNumber: z
    .string()
    .min(5, "El numero de documento debe tener al menos 5 caracteres")
    .max(50, "El numero de documento es muy largo"),
  occupation: z
    .string()
    .min(3, "La ocupacion debe tener al menos 3 caracteres"),
  monthlyIncome: z
    .string()
    .min(1, "El ingreso mensual es requerido")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "El ingreso debe ser un numero positivo",
    }),
  referenceName: z
    .string()
    .min(3, "El nombre de referencia debe tener al menos 3 caracteres"),
  referencePhone: z
    .string()
    .min(7, "El telefono de referencia debe tener al menos 7 digitos"),
  referenceRelation: z
    .string()
    .min(2, "Indica la relacion con la referencia"),
});

// Schema para solicitud de OTP
export const requestOtpSchema = z.object({
  leaseId: z.string().uuid("ID de contrato invalido"),
});

// Schema para verificacion de OTP
export const verifyOtpSchema = z.object({
  leaseId: z.string().uuid("ID de contrato invalido"),
  code: z
    .string()
    .length(6, "El codigo OTP debe tener 6 digitos")
    .regex(/^\d+$/, "El codigo OTP solo debe contener numeros"),
});

// Labels para tipos de documento
export const documentTypeLabels: Record<string, string> = {
  cc: "Cedula de Ciudadania",
  ce: "Cedula de Extranjeria",
  passport: "Pasaporte",
};

// Labels para estados del lease
export const leaseStatusLabels: Record<string, string> = {
  draft: "Borrador",
  pending_signature: "Pendiente de firma",
  pending_landlord_approval: "Pendiente de aprobacion",
  approved: "Aprobado",
  rejected: "Rechazado",
  cancelled: "Cancelado",
  active: "Activo",
  completed: "Completado",
};

export type TenantVerificationData = z.infer<typeof tenantVerificationSchema>;
export type VerifyOtpData = z.infer<typeof verifyOtpSchema>;
