import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leases } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { RentStepper } from "@/components/rent/RentStepper";
import { RentConfirmation } from "@/components/rent/RentConfirmation";

interface Step5PageProps {
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<{ leaseId?: string }>;
}

export default async function Step5Page({ params, searchParams }: Step5PageProps) {
  const { propertyId } = await params;
  const { leaseId } = await searchParams;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!leaseId) {
    redirect(`/property/${propertyId}`);
  }

  const lease = await db.query.leases.findFirst({
    where: eq(leases.id, leaseId),
    with: {
      property: true,
      landlord: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!lease || lease.tenantId !== session.user.id) {
    redirect(`/property/${propertyId}`);
  }

  // Si no ha completado los pasos anteriores, redirigir
  if (lease.currentStep < 5) {
    redirect(`/rent/${propertyId}/step-${lease.currentStep}?leaseId=${leaseId}`);
  }

  return (
    <div className="space-y-6">
      <RentStepper currentStep={5} />

      <RentConfirmation
        leaseId={lease.id}
        propertyTitle={lease.property.title}
        landlordName={lease.landlord.name || "Propietario"}
      />
    </div>
  );
}
