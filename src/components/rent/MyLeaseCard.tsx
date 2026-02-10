"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { leaseStatusLabels } from "@/lib/validations/rent";

interface MyLeaseCardProps {
  lease: {
    id: string;
    status: string;
    currentStep: number;
    monthlyRent: string;
    currency: string;
    createdAt: Date;
    tenantSignedAt: Date | null;
    landlordRespondedAt: Date | null;
    property: {
      id: string;
      title: string;
      address: string;
      city: string;
      images: { url: string; isPrimary: boolean }[];
    };
    landlord: {
      id: string;
      name: string | null;
      email: string;
    };
  };
}

const statusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  pending_signature: "bg-blue-100 text-blue-700",
  pending_landlord_approval: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-700",
};

export function MyLeaseCard({ lease }: MyLeaseCardProps) {
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: lease.currency,
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const primaryImage =
    lease.property.images.find((img) => img.isPrimary) ||
    lease.property.images[0];

  const isInProgress = ["draft", "pending_signature"].includes(lease.status);
  const isPendingApproval = lease.status === "pending_landlord_approval";

  return (
    <Card className="overflow-hidden">
      {/* Imagen */}
      <div className="h-32 bg-gray-200">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={lease.property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Sin imagen
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Propiedad */}
        <div>
          <Link
            href={`/property/${lease.property.id}`}
            className="font-semibold hover:text-blue-600 transition-colors"
          >
            {lease.property.title}
          </Link>
          <p className="text-sm text-gray-500">
            {lease.property.address}, {lease.property.city}
          </p>
        </div>

        {/* Estado */}
        <div className="flex items-center justify-between">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[lease.status] || "bg-gray-100"}`}
          >
            {leaseStatusLabels[lease.status] || lease.status}
          </span>
          <span className="text-sm font-medium text-blue-600">
            {formatPrice(lease.monthlyRent)}
          </span>
        </div>

        {/* Info adicional */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Propietario:</span>
            <span>{lease.landlord.name || lease.landlord.email}</span>
          </div>
          <div className="flex justify-between">
            <span>Iniciado:</span>
            <span>{formatDate(lease.createdAt)}</span>
          </div>
          {lease.tenantSignedAt && (
            <div className="flex justify-between">
              <span>Firmado:</span>
              <span>{formatDate(lease.tenantSignedAt)}</span>
            </div>
          )}
          {lease.landlordRespondedAt && (
            <div className="flex justify-between">
              <span>Respondido:</span>
              <span>{formatDate(lease.landlordRespondedAt)}</span>
            </div>
          )}
        </div>

        {/* Acciones */}
        {isInProgress && (
          <Button asChild size="sm" className="w-full">
            <Link href={`/rent/${lease.property.id}/step-${lease.currentStep}?leaseId=${lease.id}`}>
              Continuar proceso
            </Link>
          </Button>
        )}

        {isPendingApproval && (
          <p className="text-xs text-center text-amber-600 bg-amber-50 p-2 rounded">
            Esperando respuesta del propietario
          </p>
        )}

        {lease.status === "approved" && (
          <p className="text-xs text-center text-green-600 bg-green-50 p-2 rounded">
            ¡Solicitud aprobada!
          </p>
        )}

        {lease.status === "rejected" && (
          <p className="text-xs text-center text-red-600 bg-red-50 p-2 rounded">
            Solicitud rechazada por el propietario
          </p>
        )}
      </CardContent>
    </Card>
  );
}
