import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leases } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { RentStepper } from "@/components/rent/RentStepper";
import { OtpSignatureForm } from "@/components/rent/OtpSignatureForm";

interface Step4PageProps {
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<{ leaseId?: string }>;
}

export default async function Step4Page({ params, searchParams }: Step4PageProps) {
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

  // Si no ha completado los pasos anteriores, redirigir
  if (lease.currentStep < 4) {
    redirect(`/rent/${propertyId}/step-${lease.currentStep}?leaseId=${leaseId}`);
  }

  // Si ya paso el step 4, redirigir al paso actual
  if (lease.currentStep > 4) {
    redirect(`/rent/${propertyId}/step-${lease.currentStep}?leaseId=${leaseId}`);
  }

  return (
    <div className="space-y-6">
      <RentStepper currentStep={4} />

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Firma del Contrato</h1>
        <p className="text-gray-500 mt-2">
          Verifica tu identidad para firmar el contrato electronicamente
        </p>
      </div>

      <OtpSignatureForm leaseId={leaseId} propertyId={propertyId} />

      <Button asChild variant="outline" className="w-full">
        <Link href={`/rent/${propertyId}/step-3?leaseId=${leaseId}`}>
          Volver
        </Link>
      </Button>
    </div>
  );
}
