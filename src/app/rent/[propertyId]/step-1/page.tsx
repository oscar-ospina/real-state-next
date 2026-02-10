import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leases } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RentStepper } from "@/components/rent/RentStepper";
import { PropertySummary } from "@/components/rent/PropertySummary";

interface Step1PageProps {
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<{ leaseId?: string }>;
}

export default async function Step1Page({ params, searchParams }: Step1PageProps) {
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
      property: {
        with: {
          images: true,
        },
      },
    },
  });

  if (!lease || lease.tenantId !== session.user.id) {
    redirect(`/property/${propertyId}`);
  }

  return (
    <div className="space-y-6">
      <RentStepper currentStep={1} />

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Proceso de Arrendamiento</h1>
        <p className="text-gray-500 mt-2">
          Estas a punto de iniciar el proceso para arrendar este inmueble
        </p>
      </div>

      <PropertySummary
        property={lease.property}
        monthlyRent={lease.monthlyRent}
        currency={lease.currency}
        depositAmount={lease.depositAmount}
      />

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Pasos del proceso</h3>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                1
              </span>
              <span>
                <strong>Informacion:</strong> Revisa los detalles del inmueble y condiciones
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                2
              </span>
              <span>
                <strong>Verificacion:</strong> Completa tus datos personales y de contacto
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                3
              </span>
              <span>
                <strong>Contrato:</strong> Revisa y acepta el contrato de arrendamiento
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                4
              </span>
              <span>
                <strong>Firma:</strong> Firma el contrato con un codigo de verificacion
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                5
              </span>
              <span>
                <strong>Confirmacion:</strong> Espera la aprobacion del propietario
              </span>
            </li>
          </ol>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/property/${propertyId}`}>Cancelar</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href={`/rent/${propertyId}/step-2?leaseId=${leaseId}`}>
            Continuar
          </Link>
        </Button>
      </div>
    </div>
  );
}
