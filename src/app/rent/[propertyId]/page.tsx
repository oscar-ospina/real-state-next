import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leases } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface RentPageProps {
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<{ leaseId?: string }>;
}

export default async function RentPage({ params, searchParams }: RentPageProps) {
  const { propertyId } = await params;
  const { leaseId } = await searchParams;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!leaseId) {
    redirect(`/property/${propertyId}`);
  }

  // Obtener el lease actual
  const lease = await db.query.leases.findFirst({
    where: eq(leases.id, leaseId),
  });

  if (!lease || lease.tenantId !== session.user.id) {
    redirect(`/property/${propertyId}`);
  }

  // Redirigir al paso actual
  redirect(`/rent/${propertyId}/step-${lease.currentStep}?leaseId=${leaseId}`);
}
