import { wompiConfig } from "@/lib/config/wompi";

export interface WompiTransaction {
  id: string;
  reference: string;
  status: "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "PENDING";
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  payment_method_type?: string;
  payment_method?: {
    type: string;
    extra?: Record<string, unknown>;
  };
  created_at: string;
  finalized_at?: string;
}

/**
 * Fetch transaction status from WOMPI API
 */
export async function getWompiTransaction(
  transactionId: string
): Promise<WompiTransaction> {
  const response = await fetch(
    `${wompiConfig.apiBaseUrl}/transactions/${transactionId}`,
    {
      headers: {
        Authorization: `Bearer ${wompiConfig.publicKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`WOMPI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

/**
 * Check transaction status by reference
 * Note: WOMPI doesn't have a direct reference lookup,
 * we rely on webhooks to update our DB
 */
export async function checkTransactionByReference(
  reference: string
): Promise<WompiTransaction | null> {
  // This requires our database lookup since WOMPI doesn't provide
  // a direct reference-to-transaction endpoint
  // The webhook will have already updated our DB
  return null;
}
