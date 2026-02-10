"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OtpSignatureFormProps {
  leaseId: string;
  propertyId: string;
}

export function OtpSignatureForm({ leaseId, propertyId }: OtpSignatureFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [devCode, setDevCode] = useState<string | null>(null);

  // Contador regresivo
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      setTimeLeft(diff);

      if (diff === 0) {
        clearInterval(interval);
        setStep("request");
        setError("El codigo ha expirado. Solicita uno nuevo.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRequestOtp = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/rent/${leaseId}/otp`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al solicitar el codigo");
        setLoading(false);
        return;
      }

      setExpiresAt(new Date(data.expiresAt));
      setStep("verify");

      // En desarrollo, mostrar el codigo
      if (data.code) {
        setDevCode(data.code);
      }
    } catch {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError("El codigo debe tener 6 digitos");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/rent/${leaseId}/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al verificar el codigo");
        setLoading(false);
        return;
      }

      router.push(`/rent/${propertyId}/step-5?leaseId=${leaseId}`);
    } catch {
      setError("Error de conexion");
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firma del Contrato</CardTitle>
        <p className="text-sm text-gray-500">
          Para firmar el contrato, necesitamos verificar tu identidad con un codigo OTP
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        {step === "request" ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <p className="text-gray-600">
              Te enviaremos un codigo de 6 digitos para verificar tu identidad y
              firmar el contrato.
            </p>
            <p className="text-sm text-amber-600">
              Nota: En desarrollo, el codigo se mostrara en pantalla.
            </p>
            <Button onClick={handleRequestOtp} size="lg" disabled={loading}>
              {loading ? "Enviando..." : "Solicitar Codigo"}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {devCode && (
              <div className="bg-amber-50 text-amber-700 p-4 rounded-lg text-sm border border-amber-200 text-center">
                <strong>Codigo de desarrollo:</strong> {devCode}
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                Tiempo restante: <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-center">
                Ingresa el codigo de 6 digitos
              </label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleRequestOtp}
                disabled={loading || timeLeft > 0}
                className="flex-1"
              >
                Reenviar
              </Button>
              <Button type="submit" disabled={loading || code.length !== 6} className="flex-1">
                {loading ? "Verificando..." : "Firmar Contrato"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
