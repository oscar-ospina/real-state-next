import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties, leases, users } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  await auth(); // Verificado por layout

  // Stats
  const [
    pendingProperties,
    totalProperties,
    activeLeasesCount,
    totalUsersCount,
  ] = await Promise.all([
    db
      .select({ count: count() })
      .from(properties)
      .where(eq(properties.status, "pending_review")),
    db.select({ count: count() }).from(properties),
    db.select({ count: count() }).from(leases).where(eq(leases.status, "active")),
    db.select({ count: count() }).from(users),
  ]);

  const stats = [
    {
      label: "Propiedades Pendientes",
      value: pendingProperties[0].count,
      href: "/admin/properties",
      color: "amber",
    },
    {
      label: "Total Propiedades",
      value: totalProperties[0].count,
      color: "blue",
    },
    {
      label: "Contratos Activos",
      value: activeLeasesCount[0].count,
      color: "green",
    },
    {
      label: "Total Usuarios",
      value: totalUsersCount[0].count,
      color: "purple",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Panel de Administracion</h1>
          <p className="text-gray-600 mt-1">
            Gestiona propiedades, usuarios y contratos
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="transition-all duration-200 hover:shadow-md"
            >
              <CardContent className="p-6">
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p
                  className={`text-3xl font-bold text-${stat.color}-600`}
                >
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rapidas</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/properties">
              <Button variant="outline" className="w-full justify-start">
                <svg
                  className="w-5 h-5 mr-2"
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
                Revisar Propiedades
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button variant="outline" className="w-full justify-start">
                <svg
                  className="w-5 h-5 mr-2"
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
                Mi Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
