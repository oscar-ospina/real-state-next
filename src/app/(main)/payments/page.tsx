import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { paymentTransactions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { formatCOP } from "@/lib/utils/wompi";
import {
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Building2,
} from "lucide-react";

export default async function PaymentsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const payments = await db.query.paymentTransactions.findMany({
    where: eq(paymentTransactions.userId, session.user.id),
    with: {
      leaseApprovalFee: {
        with: {
          lease: {
            with: {
              property: {
                columns: {
                  title: true,
                  address: true,
                  city: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: (payments, { desc }) => [desc(payments.createdAt)],
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const statusConfig: Record<
    string,
    { label: string; color: string; icon: JSX.Element }
  > = {
    pending: {
      label: "Pendiente",
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <Clock className="w-4 h-4" />,
    },
    processing: {
      label: "Procesando",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: <Clock className="w-4 h-4" />,
    },
    approved: {
      label: "Aprobado",
      color: "bg-green-50 text-green-700 border-green-200",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    declined: {
      label: "Rechazado",
      color: "bg-red-50 text-red-700 border-red-200",
      icon: <XCircle className="w-4 h-4" />,
    },
    voided: {
      label: "Anulado",
      color: "bg-gray-50 text-gray-700 border-gray-200",
      icon: <XCircle className="w-4 h-4" />,
    },
    error: {
      label: "Error",
      color: "bg-red-50 text-red-700 border-red-200",
      icon: <XCircle className="w-4 h-4" />,
    },
  };

  const paymentMethodLabels: Record<string, string> = {
    card: "Tarjeta",
    pse: "PSE",
    nequi: "Nequi",
    bancolombia: "Bancolombia",
    cash: "Efectivo",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Historial de Pagos</h1>
          <p className="text-gray-600">
            Todos los pagos realizados en la plataforma
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">
                Total de Pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{payments.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">
                Pagos Aprobados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {payments.filter((p) => p.status === "approved").length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">
                Total Pagado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCOP(
                  payments
                    .filter((p) => p.status === "approved")
                    .reduce((sum, p) => sum + Number(p.amount), 0)
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payments List */}
        {payments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No hay pagos registrados</p>
              <p className="text-sm text-gray-400">
                Los pagos que realices aparecerán aquí
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Concepto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Propiedad
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Método
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {payments.map((payment) => {
                          const status = statusConfig[payment.status];
                          return (
                            <tr key={payment.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(payment.createdAt)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                Tarifa de aprobación
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {payment.leaseApprovalFee?.lease?.property
                                  ?.title || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCOP(payment.amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                                {payment.paymentMethod
                                  ? paymentMethodLabels[payment.paymentMethod]
                                  : "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}
                                >
                                  {status.icon}
                                  {status.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {payments.map((payment) => {
                const status = statusConfig[payment.status];
                return (
                  <Card key={payment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">
                            {payment.leaseApprovalFee?.lease?.property?.title ||
                              "Tarifa de aprobación"}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Monto:</span>
                          <span className="font-semibold">
                            {formatCOP(payment.amount)}
                          </span>
                        </div>
                        {payment.paymentMethod && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Método:</span>
                            <span className="capitalize">
                              {paymentMethodLabels[payment.paymentMethod]}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Fecha:</span>
                          <span>{formatDate(payment.createdAt)}</span>
                        </div>
                        {payment.paidAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Pagado:</span>
                            <span>{formatDate(payment.paidAt)}</span>
                          </div>
                        )}
                      </div>

                      {payment.leaseApprovalFee?.lease?.property && (
                        <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                          {payment.leaseApprovalFee.lease.property.address},{" "}
                          {payment.leaseApprovalFee.lease.property.city}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
