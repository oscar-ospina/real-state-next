import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userProperties = await db.query.properties.findMany({
    where: eq(properties.ownerId, session.user.id),
    with: {
      images: true,
    },
    orderBy: (properties, { desc }) => [desc(properties.createdAt)],
  });

  const isLandlord = session.user.roles?.includes("landlord");

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
              <form action="/api/auth/signout" method="POST">
                <Button variant="ghost" type="submit">
                  Cerrar Sesión
                </Button>
              </form>
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mi Dashboard</h1>
          {isLandlord && (
            <Link href="/dashboard/new-property">
              <Button>Publicar Propiedad</Button>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Mis Propiedades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{userProperties.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {userProperties.filter((p) => p.isAvailable).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Rol</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium capitalize">
                {session.user.roles?.join(", ") || "Arrendatario"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Become Landlord CTA */}
        {!isLandlord && (
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">¿Quieres publicar propiedades?</h3>
                  <p className="text-gray-600">Activa el rol de arrendador para comenzar</p>
                </div>
                <form action="/api/user/become-landlord" method="POST">
                  <Button type="submit">Ser Arrendador</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Properties */}
        {isLandlord && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Mis Propiedades</h2>
            {userProperties.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500 mb-4">Aún no tienes propiedades publicadas</p>
                  <Link href="/dashboard/new-property">
                    <Button>Publicar mi primera propiedad</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProperties.map((property) => (
                  <Card key={property.id}>
                    <div className="h-40 bg-gray-200">
                      {property.images[0] && (
                        <img
                          src={property.images[0].url}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{property.title}</h3>
                      <p className="text-sm text-gray-500">{property.city}</p>
                      <div className="flex gap-2 mt-3">
                        <Link href={`/dashboard/edit-property/${property.id}`}>
                          <Button size="sm" variant="outline">Editar</Button>
                        </Link>
                        <Link href={`/property/${property.id}`}>
                          <Button size="sm" variant="ghost">Ver</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
