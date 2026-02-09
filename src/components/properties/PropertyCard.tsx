import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { Property, PropertyImage } from "@/lib/db/schema";

interface PropertyCardProps {
  property: Property & { images: PropertyImage[] };
}

export function PropertyCard({ property }: PropertyCardProps) {
  const primaryImage = property.images.find((img) => img.isPrimary) || property.images[0];

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: property.currency,
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

  return (
    <Link href={`/property/${property.id}`}>
      <Card className="group overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-[0.99] active:shadow-lg">
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Sin imagen
            </div>
          )}
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium shadow-md transition-transform duration-200 group-hover:scale-105">
            {formatPrice(property.price)}
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1 transition-colors duration-200 group-hover:text-blue-600">{property.title}</h3>
          <p className="text-gray-500 text-sm mb-2">
            {property.neighborhood ? `${property.neighborhood}, ` : ""}{property.city}
          </p>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>{property.bedrooms} hab.</span>
            <span>{property.bathrooms} baño{property.bathrooms > 1 ? "s" : ""}</span>
            {property.areaSqm && <span>{property.areaSqm} m²</span>}
          </div>
          <div className="mt-2">
            <span className={`text-xs px-2 py-1 rounded font-medium transition-colors duration-200 ${
              property.isAvailable
                ? "bg-green-100 text-green-700 group-hover:bg-green-200"
                : "bg-red-100 text-red-700 group-hover:bg-red-200"
            }`}>
              {property.isAvailable ? "Disponible" : "No disponible"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
