import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { PropertyForm } from "@/components/properties/PropertyForm";

export default async function NewPropertyPage() {
  const session = await auth();

  // Verificacion de autenticacion
  if (!session?.user) {
    redirect("/login");
  }

  // Verificacion de rol landlord
  if (!session.user.roles?.includes("landlord")) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              RealState
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Hola, {session.user.name}</span>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Volver al Dashboard
            </Link>
            <h1 className="text-3xl font-bold mt-2">Publicar Nueva Propiedad</h1>
            <p className="text-gray-600 mt-1">
              Completa los datos de tu propiedad para publicarla
            </p>
          </div>

          <PropertyForm />
        </div>
      </main>
    </div>
  );
}
