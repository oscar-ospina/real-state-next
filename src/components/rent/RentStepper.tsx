"use client";

import { cn } from "@/lib/utils";

interface Step {
  number: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  { number: 1, title: "Informacion", description: "Resumen del inmueble" },
  { number: 2, title: "Verificacion", description: "Datos personales" },
  { number: 3, title: "Contrato", description: "Revision del contrato" },
  { number: 4, title: "Firma", description: "Firma con OTP" },
  { number: 5, title: "Confirmacion", description: "Proceso completado" },
];

interface RentStepperProps {
  currentStep: number;
}

export function RentStepper({ currentStep }: RentStepperProps) {
  return (
    <nav aria-label="Progreso" className="mb-8">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => (
          <li key={step.number} className="flex-1 relative">
            <div className="flex flex-col items-center">
              {/* Circulo */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                  currentStep > step.number
                    ? "bg-green-600 text-white"
                    : currentStep === step.number
                      ? "bg-blue-600 text-white ring-4 ring-blue-200"
                      : "bg-gray-200 text-gray-500"
                )}
              >
                {currentStep > step.number ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              {/* Titulo */}
              <span
                className={cn(
                  "mt-2 text-xs font-medium text-center hidden sm:block",
                  currentStep >= step.number ? "text-gray-900" : "text-gray-500"
                )}
              >
                {step.title}
              </span>
            </div>
            {/* Linea conectora */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute top-5 h-0.5 -translate-y-1/2",
                  currentStep > step.number ? "bg-green-600" : "bg-gray-200"
                )}
                style={{
                  left: "calc(50% + 24px)",
                  right: "calc(-50% + 24px)",
                }}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
