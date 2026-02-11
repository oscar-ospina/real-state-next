export const wompiConfig = {
  env: process.env.WOMPI_ENV || "test",
  publicKey: process.env.WOMPI_PUBLIC_KEY || "",
  privateKey: process.env.WOMPI_PRIVATE_KEY || "",
  integritySecret: process.env.WOMPI_INTEGRITY_SECRET || "",
  eventsSecret: process.env.WOMPI_EVENTS_SECRET || "",

  // URLs
  apiBaseUrl:
    process.env.WOMPI_ENV === "prod"
      ? "https://production.wompi.co/v1"
      : "https://sandbox.wompi.co/v1",

  checkoutBaseUrl:
    process.env.NEXT_PUBLIC_WOMPI_CHECKOUT_URL ||
    "https://checkout.wompi.co/l/",

  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Fee calculation
  approvalFeePercentage: 5, // 5% of monthly rent
} as const;

export function isWompiConfigured(): boolean {
  return !!(
    wompiConfig.publicKey &&
    wompiConfig.privateKey &&
    wompiConfig.integritySecret &&
    wompiConfig.eventsSecret
  );
}
