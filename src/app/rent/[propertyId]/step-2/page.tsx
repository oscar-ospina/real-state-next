import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leases, tenantProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { RentStepper } from "@/components/rent/RentStepper";
import { TenantVerificationForm } from "@/components/rent/TenantVerificationForm";

interface Step2PageProps {
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<{ leaseId?: string }>;
}

export default async function Step2Page({ params, searchParams }: Step2PageProps) {
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

  // Si ya paso el step 2, redirigir al paso actual
  if (lease.currentStep > 2) {
    redirect(`/rent/${propertyId}/step-${lease.currentStep}?leaseId=${leaseId}`);
  }

  // Actualizar currentStep a 2 si está en 1
  if (lease.currentStep === 1) {
    await db
      .update(leases)
      .set({ currentStep: 2, updatedAt: new Date() })
      .where(eq(leases.id, leaseId));
  }

  // Obtener datos existentes del perfil del tenant
  const existingProfile = await db.query.tenantProfiles.findFirst({
    where: eq(tenantProfiles.userId, session.user.id),
  });

  const initialData = existingProfile
    ? {
        documentType: existingProfile.documentType as "cc" | "ce" | "passport",
        documentNumber: existingProfile.documentNumber,
        occupation: existingProfile.occupation,
        monthlyIncome: existingProfile.monthlyIncome,
        referenceName: existingProfile.referenceName,
        referencePhone: existingProfile.referencePhone,
        referenceRelation: existingProfile.referenceRelation,
      }
    : undefined;

  return (
    <div className="space-y-6">
      <RentStepper currentStep={2} />

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Verificacion de Identidad</h1>
        <p className="text-gray-500 mt-2">
          Completa tus datos personales para continuar con el proceso
        </p>
      </div>

      <TenantVerificationForm
        leaseId={leaseId}
        propertyId={propertyId}
        initialData={initialData}
      />

      <Button asChild variant="outline" className="w-full">
        <Link href={`/rent/${propertyId}/step-1?leaseId=${leaseId}`}>
          Volver
        </Link>
      </Button>
    </div>
  );
}
