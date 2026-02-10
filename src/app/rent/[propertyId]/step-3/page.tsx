import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leases } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { RentStepper } from "@/components/rent/RentStepper";
import { ContractViewer } from "@/components/rent/ContractViewer";

interface Step3PageProps {
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<{ leaseId?: string }>;
}

export default async function Step3Page({ params, searchParams }: Step3PageProps) {
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
  });

  if (!lease || lease.tenantId !== session.user.id) {
    redirect(`/property/${propertyId}`);
  }

  // Si no ha completado el paso 2, redirigir
  if (lease.currentStep < 3) {
    redirect(`/rent/${propertyId}/step-${lease.currentStep}?leaseId=${leaseId}`);
  }

  // Si ya paso el step 3, redirigir al paso actual
  if (lease.currentStep > 3) {
    redirect(`/rent/${propertyId}/step-${lease.currentStep}?leaseId=${leaseId}`);
  }

  return (
    <div className="space-y-6">
      <RentStepper currentStep={3} />

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Contrato de Arrendamiento</h1>
        <p className="text-gray-500 mt-2">
          Revisa cuidadosamente el contrato antes de proceder a firmarlo
        </p>
      </div>

      <ContractViewer leaseId={leaseId} propertyId={propertyId} />

      <Button asChild variant="outline" className="w-full">
        <Link href={`/rent/${propertyId}/step-2?leaseId=${leaseId}`}>
          Volver
        </Link>
      </Button>
    </div>
  );
}
