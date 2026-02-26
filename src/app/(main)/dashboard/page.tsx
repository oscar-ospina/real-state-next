import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties, leases } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { LeaseRequestCard } from "@/components/rent/LeaseRequestCard";
import { MyLeaseCard } from "@/components/rent/MyLeaseCard";
import { SubmitForReviewButton } from "@/components/properties/SubmitForReviewButton";

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

  // Solicitudes de arrendamiento pendientes (como landlord)
  const pendingLeases = await db.query.leases.findMany({
    where: eq(leases.landlordId, session.user.id),
    with: {
      property: {
        columns: {
          id: true,
          title: true,
          address: true,
          city: true,
        },
      },
      tenant: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      approvalFee: {
        with: {
          payment: {
            columns: {
              status: true,
              wompiCheckoutUrl: true,
            },
          },
        },
      },
    },
    orderBy: (leases, { desc }) => [desc(leases.createdAt)],
  });

  const pendingApprovalLeases = pendingLeases.filter(
    (l) => l.status === "pending_landlord_approval"
  );

  // Mis arrendamientos (como tenant)
  const myLeases = await db.query.leases.findMany({
    where: eq(leases.tenantId, session.user.id),
    with: {
      property: {
        with: {
          images: true,
        },
      },
      landlord: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: (leases, { desc }) => [desc(leases.createdAt)],
  });

  const isLandlord = session.user.roles?.includes("landlord");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

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
        <div className="grid md:grid-cols-4 gap-6 mb-8">
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
          <Card className={pendingApprovalLeases.length > 0 ? "border-amber-300 bg-amber-50" : ""}>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Solicitudes Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${pendingApprovalLeases.length > 0 ? "text-amber-600" : ""}`}>
                {pendingApprovalLeases.length}
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

        {/* My Leases as Tenant */}
        {myLeases.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Mis Arrendamientos</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myLeases.map((lease) => (
                <MyLeaseCard key={lease.id} lease={lease} />
              ))}
            </div>
          </div>
        )}

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

        {/* Pending Lease Requests */}
        {isLandlord && pendingApprovalLeases.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Solicitudes de Arrendamiento
              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                {pendingApprovalLeases.length} pendiente{pendingApprovalLeases.length > 1 ? "s" : ""}
              </span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingApprovalLeases.map((lease) => (
                <LeaseRequestCard key={lease.id} lease={lease} />
              ))}
            </div>
          </div>
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
                {userProperties.map((property) => {
                  const statusLabels: Record<string, { label: string; color: string }> = {
                    draft: { label: "Borrador", color: "bg-gray-100 text-gray-700" },
                    pending_review: { label: "En Revision", color: "bg-amber-100 text-amber-700" },
                    approved: { label: "Aprobada", color: "bg-green-100 text-green-700" },
                    rejected: { label: "Rechazada", color: "bg-red-100 text-red-700" },
                  };

                  const statusInfo = statusLabels[property.status] || statusLabels.draft;

                  return (
                    <Card key={property.id} className="relative">
                      <div className="h-40 bg-gray-200 relative">
                        {property.images[0] && (
                          <img
                            src={property.images[0].url}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold">{property.title}</h3>
                          <p className="text-sm text-gray-500">{property.city}</p>
                        </div>

                        {property.status === "rejected" && property.rejectionReason && (
                          <div className="bg-red-50 border border-red-200 p-2 rounded">
                            <p className="text-xs text-red-700 font-medium mb-1">Motivo de rechazo:</p>
                            <p className="text-xs text-red-600">{property.rejectionReason}</p>
                          </div>
                        )}

                        <div className="flex gap-2 flex-wrap">
                          <Link href={`/dashboard/edit-property/${property.id}`}>
                            <Button size="sm" variant="outline">Editar</Button>
                          </Link>
                          {property.status === "approved" && (
                            <Link href={`/property/${property.id}`}>
                              <Button size="sm" variant="ghost">Ver</Button>
                            </Link>
                          )}
                          {(property.status === "draft" || property.status === "rejected") && (
                            <SubmitForReviewButton propertyId={property.id} />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
