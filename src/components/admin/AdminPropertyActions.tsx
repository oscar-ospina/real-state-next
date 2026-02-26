"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface AdminPropertyActionsProps {
  propertyId: string;
  currentStatus: string;
}

export function AdminPropertyActions({
  propertyId,
  currentStatus,
}: AdminPropertyActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = async () => {
    if (!confirm("¿Aprobar esta propiedad? Sera visible publicamente.")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/properties/${propertyId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al aprobar");
      }

      router.push("/admin/properties");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Debes proporcionar un motivo de rechazo");
      return;
    }

    if (!confirm("¿Rechazar esta propiedad?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/properties/${propertyId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          rejectionReason: rejectionReason.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al rechazar");
      }

      router.push("/admin/properties");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  };

  if (currentStatus !== "pending_review") {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-500">
            Esta propiedad ya ha sido {currentStatus === "approved" ? "aprobada" : "procesada"}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Acciones de Revision</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
            {error}
          </div>
        )}

        {!showRejectForm ? (
          <>
            <Button
              onClick={handleApprove}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? "Procesando..." : "Aprobar Propiedad"}
            </Button>
            <Button
              onClick={() => setShowRejectForm(true)}
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              Rechazar Propiedad
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Motivo de Rechazo *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explica por que esta propiedad no cumple con los requisitos..."
                rows={4}
                disabled={loading}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleReject}
                disabled={loading || !rejectionReason.trim()}
                variant="destructive"
                className="flex-1"
              >
                {loading ? "Procesando..." : "Confirmar Rechazo"}
              </Button>
              <Button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason("");
                  setError(null);
                }}
                disabled={loading}
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
