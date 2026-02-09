"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  propertyFormSchema,
  propertyTypeLabels,
} from "@/lib/validations/property";

export function PropertyForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [propertyType, setPropertyType] = useState("apartment");
  const [currency, setCurrency] = useState("COP");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    const data = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      propertyType: propertyType,
      price: formData.get("price") as string,
      currency: currency,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      neighborhood: (formData.get("neighborhood") as string) || undefined,
      bedrooms: parseInt(formData.get("bedrooms") as string) || 0,
      bathrooms: parseInt(formData.get("bathrooms") as string) || 1,
      areaSqm: (formData.get("areaSqm") as string) || undefined,
      isFurnished: formData.get("isFurnished") === "on",
    };

    // Validacion client-side
    const result = propertyFormSchema.safeParse(data);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        errors[path] = issue.message;
      });
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    // Enviar al API
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!res.ok) {
        const responseData = await res.json();
        setError(responseData.error || "Error al crear la propiedad");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Error de conexion. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error general */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Seccion: Informacion Basica */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Informacion Basica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titulo de la propiedad *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ej: Apartamento moderno en Chapinero"
              required
              className={fieldErrors.title ? "border-red-500" : ""}
            />
            {fieldErrors.title && (
              <p className="text-sm text-red-600">{fieldErrors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe las caracteristicas de tu propiedad..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de propiedad *</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(propertyTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-end pb-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isFurnished"
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                />
                <span className="text-sm font-medium">Amoblado</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seccion: Precio y Caracteristicas */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Precio y Caracteristicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio mensual *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="1500000"
                required
                min="0"
                className={fieldErrors.price ? "border-red-500" : ""}
              />
              {fieldErrors.price && (
                <p className="text-sm text-red-600">{fieldErrors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COP">COP (Pesos)</SelectItem>
                  <SelectItem value="USD">USD (Dolares)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Habitaciones *</Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                min="0"
                defaultValue="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Banos *</Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                min="1"
                defaultValue="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="areaSqm">Area (m2)</Label>
              <Input
                id="areaSqm"
                name="areaSqm"
                type="number"
                placeholder="80"
                min="1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seccion: Ubicacion */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Ubicacion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Direccion *</Label>
            <Input
              id="address"
              name="address"
              placeholder="Calle 100 # 15-20"
              required
              className={fieldErrors.address ? "border-red-500" : ""}
            />
            {fieldErrors.address && (
              <p className="text-sm text-red-600">{fieldErrors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad *</Label>
              <Input
                id="city"
                name="city"
                placeholder="Bogota"
                required
                className={fieldErrors.city ? "border-red-500" : ""}
              />
              {fieldErrors.city && (
                <p className="text-sm text-red-600">{fieldErrors.city}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Barrio</Label>
              <Input
                id="neighborhood"
                name="neighborhood"
                placeholder="Chapinero"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de accion */}
      <div className="flex gap-4 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Publicando..." : "Publicar Propiedad"}
        </Button>
      </div>
    </form>
  );
}
