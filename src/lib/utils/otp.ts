import crypto from "crypto";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const TEST_OTP = "123456";

export function generateOtp(): string {
  // Para testing, siempre devuelve 123456 si TEST_OTP_ENABLED=true
  if (process.env.TEST_OTP_ENABLED === "true") {
    return TEST_OTP;
  }

  // Genera un OTP aleatorio de 6 digitos
  const otp = crypto
    .randomInt(0, 1000000)
    .toString()
    .padStart(OTP_LENGTH, "0");
  return otp;
}

export function getOtpExpiryDate(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + OTP_EXPIRY_MINUTES);
  return expiry;
}

export function isOtpExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export function createSignatureHash(
  otpCode: string,
  leaseId: string,
  userId: string,
  timestamp: Date
): string {
  const data = `${otpCode}:${leaseId}:${userId}:${timestamp.toISOString()}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function getOtpExpiryMinutes(): number {
  return OTP_EXPIRY_MINUTES;
}
