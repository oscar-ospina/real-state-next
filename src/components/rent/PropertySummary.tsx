"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { propertyTypeLabels } from "@/lib/validations/property";

interface PropertySummaryProps {
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    neighborhood: string | null;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    areaSqm: string | null;
    isFurnished: boolean;
    images: { url: string; isPrimary: boolean }[];
  };
  monthlyRent: string;
  currency: string;
  depositAmount: string | null;
}

export function PropertySummary({
  property,
  monthlyRent,
  currency,
  depositAmount,
}: PropertySummaryProps) {
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

  const primaryImage =
    property.images.find((img) => img.isPrimary) || property.images[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen del Inmueble</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Imagen */}
        <div className="relative h-48 bg-gray-200 rounded-lg overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Sin imagen
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
          <p className="text-gray-500">
            {property.address}
            {property.neighborhood && `, ${property.neighborhood}`}, {property.city}
          </p>
        </div>

        {/* Caracteristicas */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            {propertyTypeLabels[property.propertyType] || property.propertyType}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            {property.bedrooms} hab.
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            {property.bathrooms} banos
          </span>
          {property.areaSqm && (
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {property.areaSqm} m2
            </span>
          )}
          {property.isFurnished && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              Amoblado
            </span>
          )}
        </div>

        {/* Condiciones economicas */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Canon mensual:</span>
            <span className="font-semibold text-blue-600">
              {formatPrice(monthlyRent)}
            </span>
          </div>
          {depositAmount && (
            <div className="flex justify-between">
              <span className="text-gray-600">Deposito:</span>
              <span className="font-semibold">{formatPrice(depositAmount)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
