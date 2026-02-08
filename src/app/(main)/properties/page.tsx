import Link from "next/link";
import { db } from "@/lib/db";
import { properties, propertyImages } from "@/lib/db/schema";
import { desc, eq, and, gte, lte, ilike } from "drizzle-orm";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchParams {
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  type?: string;
  page?: string;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 12;
  const offset = (page - 1) * limit;

  // Build filters
  const filters = [eq(properties.isAvailable, true)];

  if (params.city) {
    filters.push(ilike(properties.city, `%${params.city}%`));
  }
  if (params.minPrice) {
    filters.push(gte(properties.price, params.minPrice));
  }
  if (params.maxPrice) {
    filters.push(lte(properties.price, params.maxPrice));
  }
  if (params.bedrooms) {
    filters.push(eq(properties.bedrooms, Number(params.bedrooms)));
  }
  if (params.type) {
    filters.push(eq(properties.propertyType, params.type as "apartment" | "house" | "room" | "studio" | "commercial"));
  }

  const allProperties = await db.query.properties.findMany({
    where: and(...filters),
    with: {
      images: true,
    },
    orderBy: [desc(properties.createdAt)],
    limit,
    offset,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              RealState
            </Link>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="ghost">Iniciar Sesión</Button>
              </Link>
              <Link href="/register">
                <Button>Registrarse</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Propiedades Disponibles</h1>

        {/* Filters */}
        <form className="bg-white p-4 rounded-lg shadow mb-8">
          <div className="grid md:grid-cols-5 gap-4">
            <Input
              name="city"
              placeholder="Ciudad"
              defaultValue={params.city}
            />
            <Input
              name="minPrice"
              type="number"
              placeholder="Precio mínimo"
              defaultValue={params.minPrice}
            />
            <Input
              name="maxPrice"
              type="number"
              placeholder="Precio máximo"
              defaultValue={params.maxPrice}
            />
            <Select name="bedrooms" defaultValue={params.bedrooms}>
              <SelectTrigger>
                <SelectValue placeholder="Habitaciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 habitación</SelectItem>
                <SelectItem value="2">2 habitaciones</SelectItem>
                <SelectItem value="3">3 habitaciones</SelectItem>
                <SelectItem value="4">4+ habitaciones</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Buscar</Button>
          </div>
        </form>

        {/* Properties Grid */}
        {allProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron propiedades</p>
            <p className="text-gray-400">Intenta con otros filtros</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Link href={`/properties?page=${page - 1}`}>
              <Button variant="outline">Anterior</Button>
            </Link>
          )}
          {allProperties.length === limit && (
            <Link href={`/properties?page=${page + 1}`}>
              <Button variant="outline">Siguiente</Button>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
