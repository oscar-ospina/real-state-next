"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import { formatCOP } from "@/lib/utils/wompi";

interface PaymentStatusCheckerProps {
  leaseId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export function PaymentStatusChecker({
  leaseId,
  autoRefresh = false,
  refreshInterval = 5000,
}: PaymentStatusCheckerProps) {
  const router = useRouter();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    try {
      const response = await fetch(
        `/api/payments/approval-fee/${leaseId}/status`
      );
      if (response.ok) {
        const data = await response.json();
        setStatus(data);

        // If payment approved, refresh the page to update UI
        if (data.isPaid && autoRefresh) {
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();

    if (autoRefresh) {
      const interval = setInterval(checkStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [leaseId, autoRefresh, refreshInterval]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Verificando pago...</span>
      </div>
    );
  }

  if (!status || !status.status) {
    return null;
  }

  const statusIcons: Record<string, React.ReactElement> = {
    approved: <CheckCircle className="w-5 h-5 text-green-600" />,
    pending: <Clock className="w-5 h-5 text-amber-600" />,
    processing: <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />,
    declined: <XCircle className="w-5 h-5 text-red-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
  };

  const statusLabels: Record<string, string> = {
    approved: "Pago aprobado",
    pending: "Pago pendiente",
    processing: "Procesando pago",
    declined: "Pago rechazado",
    error: "Error en el pago",
  };

  const statusColors: Record<string, string> = {
    approved: "bg-green-50 text-green-700 border-green-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    declined: "bg-red-50 text-red-700 border-red-200",
    error: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className={`rounded-lg border p-3 ${statusColors[status.status]}`}>
      <div className="flex items-center gap-3">
        {statusIcons[status.status]}
        <div className="flex-1">
          <p className="font-medium">{statusLabels[status.status]}</p>
          {status.amount && (
            <p className="text-sm opacity-90">
              Monto: {formatCOP(status.amount)}
            </p>
          )}
          {status.paidAt && (
            <p className="text-xs opacity-75">
              {new Date(status.paidAt).toLocaleString("es-CO")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
