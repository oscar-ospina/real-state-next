import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminPropertiesPage() {
  await auth(); // Verificado por layout

  const pendingProperties = await db.query.properties.findMany({
    where: eq(properties.status, "pending_review"),
    with: {
      images: { limit: 1 },
      documents: true,
      owner: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: (properties, { asc }) => [asc(properties.createdAt)],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Panel Admin
          </Link>
          <h1 className="text-3xl font-bold">Propiedades Pendientes de Revision</h1>
          <p className="text-gray-600 mt-1">
            {pendingProperties.length} propiedad{pendingProperties.length !== 1 ? "es" : ""} esperando aprobacion
          </p>
        </div>

        {pendingProperties.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">No hay propiedades pendientes de revision</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingProperties.map((property) => {
              const primaryImage = property.images[0];
              const docsCount = property.documents.length;

              return (
                <Card
                  key={property.id}
                  className="transition-all duration-200 hover:shadow-md"
                >
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Image */}
                      <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {primaryImage ? (
                          <img
                            src={primaryImage.url}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            Sin imagen
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">
                          {property.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {property.address}, {property.city}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {property.propertyType}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            {property.publisherRole === "owner" ? "Propietario" : "Mandatario"}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                            {docsCount} documento{docsCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Publicado por: {property.owner?.name || "Usuario"} ({property.owner?.email})
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Enviado: {new Date(property.createdAt).toLocaleDateString("es-CO")}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center">
                        <Link href={`/admin/properties/${property.id}`}>
                          <Button>Revisar</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
