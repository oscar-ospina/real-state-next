"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  tenantVerificationSchema,
  documentTypeLabels,
  type TenantVerificationData,
} from "@/lib/validations/rent";

interface TenantVerificationFormProps {
  leaseId: string;
  propertyId: string;
  initialData?: Partial<TenantVerificationData>;
}

export function TenantVerificationForm({
  leaseId,
  propertyId,
  initialData,
}: TenantVerificationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<TenantVerificationData>({
    documentType: initialData?.documentType || "cc",
    documentNumber: initialData?.documentNumber || "",
    occupation: initialData?.occupation || "",
    monthlyIncome: initialData?.monthlyIncome || "",
    referenceName: initialData?.referenceName || "",
    referencePhone: initialData?.referencePhone || "",
    referenceRelation: initialData?.referenceRelation || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = tenantVerificationSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        errors[path] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/rent/${leaseId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al guardar los datos");
        setLoading(false);
        return;
      }

      router.push(`/rent/${propertyId}/step-3?leaseId=${leaseId}`);
    } catch {
      setError("Error de conexion");
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verificacion de Identidad</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* Documento */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Tipo de documento
              </label>
              <select
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(documentTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {fieldErrors.documentType && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldErrors.documentType}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Numero de documento
              </label>
              <Input
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleChange}
                placeholder="Ej: 1234567890"
              />
              {fieldErrors.documentNumber && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldErrors.documentNumber}
                </p>
              )}
            </div>
          </div>

          {/* Ocupacion e ingresos */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Ocupacion
              </label>
              <Input
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="Ej: Ingeniero de Software"
              />
              {fieldErrors.occupation && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldErrors.occupation}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Ingresos mensuales (COP)
              </label>
              <Input
                name="monthlyIncome"
                type="number"
                value={formData.monthlyIncome}
                onChange={handleChange}
                placeholder="Ej: 5000000"
              />
              {fieldErrors.monthlyIncome && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldErrors.monthlyIncome}
                </p>
              )}
            </div>
          </div>

          {/* Referencia personal */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-4">Referencia Personal</h4>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre completo
                </label>
                <Input
                  name="referenceName"
                  value={formData.referenceName}
                  onChange={handleChange}
                  placeholder="Nombre de la referencia"
                />
                {fieldErrors.referenceName && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors.referenceName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Telefono
                </label>
                <Input
                  name="referencePhone"
                  value={formData.referencePhone}
                  onChange={handleChange}
                  placeholder="Ej: 3001234567"
                />
                {fieldErrors.referencePhone && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors.referencePhone}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Relacion
                </label>
                <Input
                  name="referenceRelation"
                  value={formData.referenceRelation}
                  onChange={handleChange}
                  placeholder="Ej: Familiar, Amigo"
                />
                {fieldErrors.referenceRelation && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors.referenceRelation}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Guardando..." : "Continuar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
