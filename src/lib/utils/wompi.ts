import crypto from "crypto";
import { wompiConfig } from "@/lib/config/wompi";

/**
 * Generate WOMPI integrity signature for transaction
 * Format: SHA256(reference + amountInCents + currency + integritySecret)
 */
export function generateWompiIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string = "COP"
): string {
  const concatenated = `${reference}${amountInCents}${currency}${wompiConfig.integritySecret}`;
  return crypto.createHash("sha256").update(concatenated).digest("hex");
}

/**
 * Validate WOMPI webhook event signature
 * Concatenates properties in order + timestamp + eventsSecret
 */
export function validateWebhookSignature(
  properties: string[],
  timestamp: number,
  receivedChecksum: string
): boolean {
  const concatenated = [
    ...properties,
    timestamp.toString(),
    wompiConfig.eventsSecret,
  ].join("");
  const calculatedChecksum = crypto
    .createHash("sha256")
    .update(concatenated)
    .digest("hex");
  return (
    calculatedChecksum.toUpperCase() === receivedChecksum.toUpperCase()
  );
}

/**
 * Generate unique payment reference
 * Format: LEASE-{leaseId}-{timestamp}
 */
export function generatePaymentReference(leaseId: string): string {
  const timestamp = Date.now();
  return `LEASE-${leaseId}-${timestamp}`;
}

/**
 * Convert COP amount to cents for WOMPI
 */
export function copToCents(amount: number | string): number {
  return Math.round(Number(amount) * 100);
}

/**
 * Convert cents to COP
 */
export function centsToCop(cents: number): number {
  return cents / 100;
}

/**
 * Calculate approval fee (5% of monthly rent)
 */
export function calculateApprovalFee(monthlyRent: number | string): number {
  const rent = Number(monthlyRent);
  return Math.round((rent * wompiConfig.approvalFeePercentage) / 100);
}

/**
 * Build WOMPI checkout URL
 */
export function buildCheckoutUrl(reference: string): string {
  return `${wompiConfig.checkoutBaseUrl}${reference}`;
}

/**
 * Format price for display in Colombian Pesos
 */
export function formatCOP(amount: number | string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(amount));
}
