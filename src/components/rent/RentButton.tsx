"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface RentButtonProps {
  propertyId: string;
  isAvailable: boolean;
  isAuthenticated: boolean;
  isTenant: boolean;
  isOwner: boolean;
}

export function RentButton({
  propertyId,
  isAvailable,
  isAuthenticated,
  isTenant,
  isOwner,
}: RentButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No mostrar si es el propietario
  if (isOwner) {
    return null;
  }

  // Si no está autenticado, mostrar botón que redirige a login
  if (!isAuthenticated) {
    return (
      <Button
        className="w-full"
        size="lg"
        variant="secondary"
        onClick={() => router.push("/login")}
      >
        Inicia sesion para arrendar
      </Button>
    );
  }

  // Si no es tenant, no mostrar
  if (!isTenant) {
    return null;
  }

  const handleRent = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Si ya existe un lease, redirigir a ese
        if (data.leaseId) {
          router.push(`/rent/${propertyId}?leaseId=${data.leaseId}`);
          return;
        }
        setError(data.error || "Error al iniciar proceso");
        setLoading(false);
        return;
      }

      router.push(`/rent/${propertyId}?leaseId=${data.id}`);
    } catch {
      setError("Error de conexion");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        className="w-full bg-green-600 hover:bg-green-700"
        size="lg"
        onClick={handleRent}
        disabled={!isAvailable || loading}
      >
        {loading ? "Iniciando..." : "Arrendar"}
      </Button>
      {!isAvailable && (
        <p className="text-xs text-center text-gray-500">
          Esta propiedad no esta disponible
        </p>
      )}
      {error && <p className="text-xs text-center text-red-600">{error}</p>}
    </div>
  );
}
