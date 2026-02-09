import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { PropertyForm } from "@/components/properties/PropertyForm";

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({
  params,
}: EditPropertyPageProps) {
  const { id } = await params;
  const session = await auth();

  // Verificacion de autenticacion
  if (!session?.user) {
    redirect("/login");
  }

  // Obtener la propiedad
  const property = await db.query.properties.findFirst({
    where: eq(properties.id, id),
  });

  if (!property) {
    notFound();
  }

  // Verificar que es el dueño o admin
  const isOwner = property.ownerId === session.user.id;
  const isAdmin = session.user.roles?.includes("admin");

  if (!isOwner && !isAdmin) {
    redirect("/dashboard");
  }

  // Preparar datos para el formulario
  const initialData = {
    id: property.id,
    title: property.title,
    description: property.description,
    propertyType: property.propertyType,
    price: property.price,
    currency: property.currency,
    address: property.address,
    city: property.city,
    neighborhood: property.neighborhood,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaSqm: property.areaSqm,
    isFurnished: property.isFurnished,
    isAvailable: property.isAvailable,
  };

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
            <h1 className="text-3xl font-bold mt-2">Editar Propiedad</h1>
            <p className="text-gray-600 mt-1">
              Actualiza los datos de tu propiedad
            </p>
          </div>

          <PropertyForm initialData={initialData} mode="edit" />
        </div>
      </main>
    </div>
  );
}
