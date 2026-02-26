import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Quiénes Somos",
  description:
    "Conoce más sobre RealState, la plataforma que conecta arrendadores y arrendatarios en Colombia de forma fácil y segura.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Quiénes Somos
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Conectamos arrendadores con arrendatarios de forma fácil, segura y
            transparente en toda Colombia.
          </p>
        </div>

        {/* Misión Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Nuestra Misión</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              En RealState, nuestra misión es simplificar el proceso de
              arrendamiento de propiedades en Colombia. Creemos que encontrar el
              hogar perfecto o el inquilino ideal no debería ser complicado.
              Por eso, hemos creado una plataforma intuitiva que conecta a
              propietarios y arrendatarios de manera directa, eliminando
              intermediarios innecesarios y reduciendo costos.
            </p>
          </CardContent>
        </Card>

        {/* Cómo Funciona */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            ¿Cómo Funciona?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-xl">1. Busca</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Explora cientos de propiedades disponibles con filtros
                  avanzados por ciudad, precio, tipo de inmueble y más.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-xl">2. Contacta</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Inicia el proceso de arrendamiento directamente con el
                  propietario. Completa la verificación y firma el contrato
                  digital.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <CardTitle className="text-xl">3. Múdate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Una vez aprobado, realiza el pago y coordina la entrega.
                  ¡Así de simple es encontrar tu nuevo hogar!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Valores */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Nuestros Valores</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div>
                  <strong className="text-foreground">Transparencia:</strong>{" "}
                  <span className="text-muted-foreground">
                    Información clara y verificada de cada propiedad.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div>
                  <strong className="text-foreground">Seguridad:</strong>{" "}
                  <span className="text-muted-foreground">
                    Procesos de verificación y contratos digitales legalmente
                    válidos.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div>
                  <strong className="text-foreground">Simplicidad:</strong>{" "}
                  <span className="text-muted-foreground">
                    Un proceso fácil de seguir, desde la búsqueda hasta la firma.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div>
                  <strong className="text-foreground">Accesibilidad:</strong>{" "}
                  <span className="text-muted-foreground">
                    Sin comisiones ocultas, solo tarifas claras y justas.
                  </span>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <div className="text-center bg-blue-50 dark:bg-blue-950 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">¿Tienes preguntas?</h2>
          <p className="text-muted-foreground mb-6">
            Nuestro equipo está listo para ayudarte. Contáctanos por WhatsApp y
            te responderemos lo más pronto posible.
          </p>
          <p className="text-sm text-muted-foreground">
            Haz clic en el botón flotante de WhatsApp en la esquina inferior
            derecha.
          </p>
        </div>
      </main>
    </div>
  );
}
