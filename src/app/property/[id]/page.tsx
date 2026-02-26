import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { propertyTypeLabels } from "@/lib/validations/property";
import { Header } from "@/components/layout/Header";
import { ContactSection } from "@/components/properties/ContactSection";
import { RentButton } from "@/components/rent/RentButton";

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await db.query.properties.findFirst({
    where: eq(properties.id, id),
    with: { images: true },
  });

  if (!property) {
    return { title: "Propiedad no encontrada" };
  }

  const price = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: property.currency,
    minimumFractionDigits: 0,
  }).format(Number(property.price));

  const typeLabel =
    propertyTypeLabels[property.propertyType] || property.propertyType;
  const description = `${typeLabel} en ${property.city} - ${price}/mes. ${property.bedrooms} habitaciones, ${property.bathrooms} baños${property.areaSqm ? `, ${property.areaSqm} m²` : ""}.`;
  const primaryImage =
    property.images.find((img) => img.isPrimary) || property.images[0];

  return {
    title: property.title,
    description,
    openGraph: {
      title: property.title,
      description,
      type: "article",
      ...(primaryImage && { images: [{ url: primaryImage.url }] }),
    },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const session = await auth();

  const property = await db.query.properties.findFirst({
    where: eq(properties.id, id),
    with: {
      images: {
        orderBy: (images, { asc }) => [asc(images.order)],
      },
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

  const imageMedia = property.images.filter(
    (img) => !img.mediaType || img.mediaType === "image"
  );
  const videoMedia = property.images.filter(
    (img) => img.mediaType === "video"
  );
  const primaryImage =
    imageMedia.find((img) => img.isPrimary) || imageMedia[0];

  // Variables para RentButton
  const isAuthenticated = !!session?.user;
  const isTenant = session?.user?.roles?.includes("tenant") ?? false;
  const isOwner = property.ownerId === session?.user?.id;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description || undefined,
    url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/property/${property.id}`,
    ...(primaryImage && { image: primaryImage.url }),
    datePosted: property.createdAt.toISOString(),
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.city,
      addressCountry: "CO",
      ...(property.neighborhood && {
        addressRegion: property.neighborhood,
      }),
    },
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: property.currency,
      availability: property.isAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    ...(property.areaSqm && {
      floorSize: {
        "@type": "QuantitativeValue",
        value: Number(property.areaSqm),
        unitCode: "MTK",
      },
    }),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/properties"
          className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1 mb-6"
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
          Volver a propiedades
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <Card className="overflow-hidden">
              <div className="relative h-80 md:h-96 bg-gray-200">
                {primaryImage ? (
                  <img
                    src={primaryImage.url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Sin imagen
                  </div>
                )}
                {/* Status badge */}
                <div
                  className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${
                    property.isAvailable
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {property.isAvailable ? "Disponible" : "No disponible"}
                </div>
              </div>

              {/* Thumbnail gallery */}
              {property.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {property.images.map((image, index) => (
                    <div
                      key={image.id}
                      className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 relative ${
                        image.id === primaryImage?.id
                          ? "border-blue-500"
                          : "border-transparent"
                      }`}
                    >
                      {image.mediaType === "video" ? (
                        <>
                          <video
                            src={image.url}
                            className="w-full h-full object-cover"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <img
                          src={image.url}
                          alt={`${property.title} - foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Video gallery */}
              {videoMedia.length > 0 && (
                <div className="p-4 space-y-3 border-t">
                  <h3 className="text-sm font-semibold text-gray-700">Videos</h3>
                  <div className="grid gap-3">
                    {videoMedia.map((video) => (
                      <video
                        key={video.id}
                        src={video.url}
                        controls
                        className="w-full rounded-lg max-h-96"
                        preload="metadata"
                      >
                        Tu navegador no soporta la reproduccion de video.
                      </video>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Property details */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    {property.title}
                  </h1>
                  <p className="text-gray-500">
                    {property.address},{" "}
                    {property.neighborhood && `${property.neighborhood}, `}
                    {property.city}
                  </p>
                </div>

                {/* Property type and features */}
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {propertyTypeLabels[property.propertyType] ||
                      property.propertyType}
                  </span>
                  {property.isFurnished && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      Amoblado
                    </span>
                  )}
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-4 py-4 border-y">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {property.bedrooms}
                    </p>
                    <p className="text-sm text-gray-500">Habitaciones</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {property.bathrooms}
                    </p>
                    <p className="text-sm text-gray-500">Baños</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {property.areaSqm || "-"}
                    </p>
                    <p className="text-sm text-gray-500">m2</p>
                  </div>
                </div>

                {/* Description */}
                {property.description && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Descripcion</h2>
                    <p className="text-gray-600 whitespace-pre-line">
                      {property.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price card */}
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Precio mensual</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatPrice(property.price)}
                  </p>
                  {property.isNegotiable && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                      Precio negociable
                    </span>
                  )}
                </div>

                <ContactSection
                  ownerName={property.owner?.name || "Usuario"}
                  ownerEmail={property.owner?.email || ""}
                  ownerPhone={property.owner?.phone}
                  propertyTitle={property.title}
                />
                <Button variant="outline" className="w-full mt-3" size="lg">
                  Agendar visita
                </Button>
                <div className="mt-3">
                  <RentButton
                    propertyId={property.id}
                    isAvailable={property.isAvailable}
                    isAuthenticated={isAuthenticated}
                    isTenant={isTenant}
                    isOwner={isOwner}
                  />
                </div>

                {/* Owner info */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-500 mb-2">Publicado por</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {property.owner?.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {property.owner?.name || "Usuario"}
                      </p>
                      <p className="text-sm text-gray-500">Arrendador</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Ubicacion</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">Direccion:</span>{" "}
                    {property.address}
                  </p>
                  {property.neighborhood && (
                    <p>
                      <span className="text-gray-500">Barrio:</span>{" "}
                      {property.neighborhood}
                    </p>
                  )}
                  <p>
                    <span className="text-gray-500">Ciudad:</span>{" "}
                    {property.city}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
