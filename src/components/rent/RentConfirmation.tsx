"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface RentConfirmationProps {
  leaseId: string;
  propertyTitle: string;
  landlordName: string;
}

export function RentConfirmation({
  leaseId,
  propertyTitle,
  landlordName,
}: RentConfirmationProps) {
  return (
    <Card>
      <CardContent className="p-8 text-center space-y-6">
        {/* Icono de exito */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Contrato Firmado Exitosamente
          </h2>
          <p className="text-gray-600">
            Tu solicitud de arrendamiento ha sido enviada al propietario.
          </p>
        </div>

        {/* Detalles */}
        <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Propiedad:</span>
            <span className="font-medium">{propertyTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Propietario:</span>
            <span className="font-medium">{landlordName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">ID del contrato:</span>
            <span className="font-mono text-sm">{leaseId.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Estado:</span>
            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-sm">
              Pendiente de aprobacion
            </span>
          </div>
        </div>

        {/* Mensaje informativo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>{landlordName}</strong> recibira una notificacion sobre tu
            solicitud. Te informaremos cuando haya una respuesta.
          </p>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/dashboard">Ir al Dashboard</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/properties">Ver mas propiedades</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
