"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText } from "lucide-react";

interface LandlordContractViewerProps {
  leaseId: string;
}

export function LandlordContractViewer({
  leaseId,
}: LandlordContractViewerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractHtml, setContractHtml] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const fetchContract = async () => {
      setLoading(true);
      setError(null);

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
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [leaseId, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <FileText className="w-4 h-4 mr-2" />
          Ver contrato
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Contrato de Arrendamiento</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500 text-sm">Cargando contrato...</p>
            </div>
          </div>
        )}

        {error && !contractHtml && (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200 max-w-md">
              {error}
            </div>
          </div>
        )}

        {!loading && !error && contractHtml && (
          <div className="flex-1 overflow-y-auto border rounded-lg p-6 bg-white">
            <div dangerouslySetInnerHTML={{ __html: contractHtml }} />
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
