"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SubmitForReviewButtonProps {
  propertyId: string;
}

export function SubmitForReviewButton({ propertyId }: SubmitForReviewButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!confirm("¿Enviar esta propiedad a revision? Sera revisada por un administrador antes de publicarse.")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/properties/${propertyId}/submit`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.missingRequirements?.length) {
          alert(`Faltan requisitos para enviar a revisión:\n- ${data.missingRequirements.join("\n- ")}`);
        } else if (data.missingDocuments) {
          alert(`Faltan documentos requeridos:\n- ${data.missingDocuments.join("\n- ")}`);
        } else {
          alert(data.error || "Error al enviar");
        }
        setLoading(false);
        return;
      }

      alert("Propiedad enviada a revision exitosamente");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleSubmit}
        disabled={loading}
        size="sm"
        className="bg-green-600 hover:bg-green-700"
      >
        {loading ? "Enviando..." : "Enviar a Revision"}
      </Button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </>
  );
}
