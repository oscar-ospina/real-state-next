"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContractViewerProps {
  leaseId: string;
  propertyId: string;
}

export function ContractViewer({ leaseId, propertyId }: ContractViewerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractHtml, setContractHtml] = useState<string | null>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const contractRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await fetch(`/api/rent/${leaseId}/contract`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Error al cargar el contrato");
          return;
        }
        const data = await res.json();
        setContractHtml(data.contractHtml);
      } catch {
        setError("Error de conexion");
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [leaseId]);

  const handleScroll = () => {
    if (contractRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contractRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setHasScrolledToBottom(true);
      }
    }
  };

  const handleSubmit = async () => {
    if (!accepted) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/rent/${leaseId}/contract`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al procesar el contrato");
        setSubmitting(false);
        return;
      }

      router.push(`/rent/${propertyId}/step-4?leaseId=${leaseId}`);
    } catch {
      setError("Error de conexion");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando contrato...</p>
        </CardContent>
      </Card>
    );
  }

  if (error && !contractHtml) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contrato de Arrendamiento</CardTitle>
        <p className="text-sm text-gray-500">
          Por favor lee el contrato completo antes de continuar
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* Contenedor del contrato */}
        <div
          ref={contractRef}
          onScroll={handleScroll}
          className="h-96 overflow-y-auto border rounded-lg p-4 bg-white"
          dangerouslySetInnerHTML={{ __html: contractHtml || "" }}
        />

        {!hasScrolledToBottom && (
          <p className="text-sm text-amber-600 text-center">
            Desplazate hasta el final del contrato para continuar
          </p>
        )}

        {/* Checkbox de aceptacion */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            disabled={!hasScrolledToBottom}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
          />
          <span
            className={`text-sm ${hasScrolledToBottom ? "text-gray-700" : "text-gray-400"}`}
          >
            He leido y acepto los terminos y condiciones del contrato de
            arrendamiento
          </span>
        </label>

        <Button
          onClick={handleSubmit}
          className="w-full"
          size="lg"
          disabled={!accepted || submitting}
        >
          {submitting ? "Procesando..." : "Proceder a Firmar"}
        </Button>
      </CardContent>
    </Card>
  );
}
