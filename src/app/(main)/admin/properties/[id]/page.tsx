import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { propertyTypeLabels } from "@/lib/validations/property";
import { AdminPropertyActions } from "@/components/admin/AdminPropertyActions";

interface AdminPropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPropertyDetailPage({
  params,
}: AdminPropertyDetailPageProps) {
  const { id } = await params;
  await auth(); // Verificado por layout

  const property = await db.query.properties.findFirst({
    where: eq(properties.id, id),
    with: {
      images: { orderBy: (images, { asc }) => [asc(images.order)] },
      documents: true,
      owner: {
        columns: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!property) {
    notFound();
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: property.currency,
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

  const primaryImage =
    property.images.find((img) => img.isPrimary) || property.images[0];

  const documentLabels: Record<string, string> = {
    escritura_publica: "Escritura Publica",
    certificado_tradicion: "Certificado de Tradicion y Libertad",
    contrato_mandato: "Contrato de Mandato",
    reglamento_propiedad_horizontal: "Reglamento de Propiedad Horizontal",
    paz_y_salvo_admin: "Paz y Salvo de Administracion",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/admin/properties"
            className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Propiedades Pendientes
          </Link>
          <h1 className="text-3xl font-bold">Revision de Propiedad</h1>
          <p className="text-gray-600 mt-1">
            Estado: <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-sm font-medium">{property.status}</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <div className="relative h-80 bg-gray-200">
                {primaryImage ? (
                  primaryImage.mediaType === "video" ? (
                    <video src={primaryImage.url} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={primaryImage.url} alt={property.title} className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Sin imagen
                  </div>
                )}
              </div>

              {property.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {property.images.map((image) => (
                    <div key={image.id} className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2">
                      {image.mediaType === "video" ? (
                        <video src={image.url} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={image.url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>{property.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Precio mensual</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(property.price)}
                    {property.isNegotiable && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                        Negociable
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                    {propertyTypeLabels[property.propertyType] || property.propertyType}
                  </span>
                  {property.isFurnished && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                      Amoblado
                    </span>
                  )}
                  {property.isHorizontalProperty && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                      Propiedad Horizontal
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 py-4 border-y">
                  <div>
                    <p className="text-sm text-gray-500">Habitaciones</p>
                    <p className="text-lg font-semibold">{property.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Baños</p>
                    <p className="text-lg font-semibold">{property.bathrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Area (m²)</p>
                    <p className="text-lg font-semibold">{property.areaSqm || "-"}</p>
                  </div>
                </div>

                {property.description && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Descripcion</p>
                    <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 mb-1">Ubicacion</p>
                  <p className="text-gray-700">{property.address}</p>
                  <p className="text-gray-700">
                    {property.neighborhood && `${property.neighborhood}, `}{property.city}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informacion del Publicador</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-500">Rol</p>
                  <p className="font-medium">
                    {property.publisherRole === "owner" ? "Propietario" : "Mandatario"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Nombre</p>
                  <p className="font-medium">{property.owner?.name || "Usuario"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{property.owner?.email}</p>
                </div>
                {property.owner?.phone && (
                  <div>
                    <p className="text-gray-500">Telefono</p>
                    <p className="font-medium">{property.owner.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Documentos de Verificacion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {property.documents.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay documentos subidos</p>
                ) : (
                  property.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors text-sm"
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <span className="flex-1">{documentLabels[doc.documentType] || doc.documentType}</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <AdminPropertyActions propertyId={property.id} currentStatus={property.status} />
          </div>
        </div>
      </main>
    </div>
  );
}
