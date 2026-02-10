"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LeaseRequestCardProps {
  lease: {
    id: string;
    monthlyRent: string;
    currency: string;
    tenantSignedAt: Date | null;
    property: {
      id: string;
      title: string;
      address: string;
      city: string;
    };
    tenant: {
      id: string;
      name: string | null;
      email: string;
    };
  };
}

export function LeaseRequestCard({ lease }: LeaseRequestCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const handleResponse = async (action: "approve" | "reject") => {
    setLoading(action);
    setError(null);

    try {
      const res = await fetch(`/api/rent/${lease.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al procesar la respuesta");
        setLoading(null);
        return;
      }

      router.refresh();
    } catch {
      setError("Error de conexion");
      setLoading(null);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-2 rounded text-sm mb-3">
            {error}
          </div>
        )}

        {/* Propiedad */}
        <div className="mb-3">
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

        {/* Info del tenant */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Solicitante:</span>
            <span className="font-medium">{lease.tenant.name || lease.tenant.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Email:</span>
            <span>{lease.tenant.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Canon:</span>
            <span className="font-medium text-blue-600">
              {formatPrice(lease.monthlyRent)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Firmado:</span>
            <span>{formatDate(lease.tenantSignedAt)}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => handleResponse("reject")}
            disabled={loading !== null}
          >
            {loading === "reject" ? "..." : "Rechazar"}
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => handleResponse("approve")}
            disabled={loading !== null}
          >
            {loading === "approve" ? "..." : "Aprobar"}
          </Button>
        </div>

        {/* Ver contrato */}
        <Link
          href={`/api/rent/${lease.id}/contract`}
          target="_blank"
          className="block text-center text-sm text-blue-600 hover:underline mt-2"
        >
          Ver contrato
        </Link>
      </CardContent>
    </Card>
  );
}
