"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { formatCOP } from "@/lib/utils/wompi";

interface ApprovalFeePaymentButtonProps {
  leaseId: string;
  monthlyRent: number | string;
  existingPayment?: {
    checkoutUrl: string;
    status: string;
  } | null;
}

export function ApprovalFeePaymentButton({
  leaseId,
  monthlyRent,
  existingPayment,
}: ApprovalFeePaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const feeAmount = Math.round((Number(monthlyRent) * 5) / 100);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // If existing payment, redirect directly
      if (existingPayment?.checkoutUrl) {
        window.open(existingPayment.checkoutUrl, "_blank");
        setLoading(false);
        return;
      }

      // Create new payment
      const response = await fetch("/api/payments/approval-fee/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaseId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear el pago");
      }

      const data = await response.json();

      // Redirect to WOMPI checkout
      window.open(data.checkoutUrl, "_blank");
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">
              Tarifa de Aprobación Requerida
            </h4>
            <p className="text-sm text-blue-700 mb-3">
              Para aprobar este contrato, debes pagar una tarifa del 5% del
              canon mensual. Este pago se procesa de forma segura a través de
              WOMPI.
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600">Canon mensual:</p>
                <p className="font-medium text-blue-900">
                  {formatCOP(monthlyRent)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-600">Tarifa (5%):</p>
                <p className="text-lg font-bold text-blue-900">
                  {formatCOP(feeAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Redirigiendo...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            {existingPayment ? "Continuar con el pago" : "Pagar ahora"}
            <ExternalLink className="w-4 h-4" />
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Serás redirigido a la pasarela de pago segura de WOMPI
      </p>
    </div>
  );
}
