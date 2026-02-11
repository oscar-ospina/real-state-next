"use client";

import { AlertCircle } from "lucide-react";
import { formatCOP } from "@/lib/utils/wompi";

interface PaymentRequiredBadgeProps {
  amount: number | string;
  isPaid: boolean;
}

export function PaymentRequiredBadge({
  amount,
  isPaid,
}: PaymentRequiredBadgeProps) {
  if (isPaid) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        Pago verificado
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
      <AlertCircle className="w-4 h-4" />
      Pago requerido: {formatCOP(amount)}
    </div>
  );
}
