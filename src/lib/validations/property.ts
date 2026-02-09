import { z } from "zod";

export const propertyFormSchema = z.object({
  title: z.string().min(5, "El titulo debe tener al menos 5 caracteres"),
  description: z.string().optional(),
  propertyType: z.enum(["apartment", "house", "room", "studio", "commercial"], {
    required_error: "Selecciona un tipo de propiedad",
  }),
  price: z.string().min(1, "El precio es requerido"),
  currency: z.string().default("COP"),
  address: z.string().min(5, "La direccion debe tener al menos 5 caracteres"),
  city: z.string().min(2, "La ciudad debe tener al menos 2 caracteres"),
  neighborhood: z.string().optional(),
  bedrooms: z.number().min(0, "Minimo 0 habitaciones"),
  bathrooms: z.number().min(1, "Minimo 1 bano"),
  areaSqm: z.string().optional(),
  isFurnished: z.boolean().default(false),
});

export type PropertyFormData = z.infer<typeof propertyFormSchema>;

export const propertyTypeLabels: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  room: "Habitacion",
  studio: "Estudio",
  commercial: "Local Comercial",
};
