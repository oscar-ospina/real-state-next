import type { Property, User, TenantProfile, Lease } from "@/lib/db/schema";

interface ContractData {
  property: Property;
  landlord: Pick<User, "id" | "name" | "email" | "phone">;
  tenant: Pick<User, "id" | "name" | "email">;
  tenantProfile: TenantProfile;
  lease: Lease;
}

export function generateLeaseContract(data: ContractData): string {
  const { property, landlord, tenant, tenantProfile, lease } = data;

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: lease.currency,
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "[Por definir]";
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const documentTypeLabels: Record<string, string> = {
    cc: "C.C.",
    ce: "C.E.",
    passport: "Pasaporte",
  };

  return `
    <div class="contract-container" style="font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.8;">
      <header style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px;">
        <h1 style="font-size: 24px; margin-bottom: 10px;">CONTRATO DE ARRENDAMIENTO DE VIVIENDA URBANA</h1>
        <p style="color: #666;">Ley 820 de 2003 - Colombia</p>
      </header>

      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">PARTES CONTRATANTES</h2>

        <div style="margin: 20px 0;">
          <h3 style="font-size: 16px; color: #333;">ARRENDADOR:</h3>
          <p><strong>Nombre:</strong> ${landlord.name || "No especificado"}</p>
          <p><strong>Email:</strong> ${landlord.email}</p>
          <p><strong>Telefono:</strong> ${landlord.phone || "No especificado"}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="font-size: 16px; color: #333;">ARRENDATARIO:</h3>
          <p><strong>Nombre:</strong> ${tenant.name || "No especificado"}</p>
          <p><strong>Documento:</strong> ${documentTypeLabels[tenantProfile.documentType] || tenantProfile.documentType} ${tenantProfile.documentNumber}</p>
          <p><strong>Email:</strong> ${tenant.email}</p>
          <p><strong>Ocupacion:</strong> ${tenantProfile.occupation}</p>
        </div>
      </section>

      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">OBJETO DEL CONTRATO</h2>
        <p>El ARRENDADOR da en arrendamiento al ARRENDATARIO el siguiente inmueble:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Inmueble:</strong> ${property.title}</p>
          <p><strong>Direccion:</strong> ${property.address}</p>
          <p><strong>Ciudad:</strong> ${property.city}${property.neighborhood ? `, ${property.neighborhood}` : ""}</p>
          <p><strong>Tipo:</strong> ${property.propertyType}</p>
          <p><strong>Caracteristicas:</strong> ${property.bedrooms} habitaciones, ${property.bathrooms} banos${property.areaSqm ? `, ${property.areaSqm} m2` : ""}</p>
          <p><strong>Amoblado:</strong> ${property.isFurnished ? "Si" : "No"}</p>
        </div>
      </section>

      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">CONDICIONES ECONOMICAS</h2>
        <p><strong>Canon de arrendamiento mensual:</strong> ${formatCurrency(lease.monthlyRent)}</p>
        ${lease.depositAmount ? `<p><strong>Deposito de garantia:</strong> ${formatCurrency(lease.depositAmount)}</p>` : ""}
        <p>El pago del canon se realizara dentro de los primeros cinco (5) dias de cada mes.</p>
      </section>

      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">DURACION</h2>
        <p><strong>Fecha de inicio:</strong> ${formatDate(lease.startDate)}</p>
        <p><strong>Fecha de finalizacion:</strong> ${formatDate(lease.endDate)}</p>
        <p>El contrato tendra una duracion inicial de doce (12) meses, renovable automaticamente por periodos iguales.</p>
      </section>

      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">CLAUSULAS GENERALES</h2>
        <ol style="padding-left: 20px;">
          <li style="margin-bottom: 10px;">El arrendatario se compromete a usar el inmueble exclusivamente para vivienda.</li>
          <li style="margin-bottom: 10px;">Queda prohibido el subarriendo total o parcial del inmueble.</li>
          <li style="margin-bottom: 10px;">El arrendatario se obliga a mantener el inmueble en buen estado.</li>
          <li style="margin-bottom: 10px;">Los servicios publicos estaran a cargo del arrendatario.</li>
          <li style="margin-bottom: 10px;">El arrendador podra realizar visitas previo aviso de 24 horas.</li>
          <li style="margin-bottom: 10px;">Para la terminacion anticipada se requiere preaviso de tres (3) meses.</li>
        </ol>
      </section>

      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">REFERENCIA PERSONAL</h2>
        <p><strong>Nombre:</strong> ${tenantProfile.referenceName}</p>
        <p><strong>Telefono:</strong> ${tenantProfile.referencePhone}</p>
        <p><strong>Relacion:</strong> ${tenantProfile.referenceRelation}</p>
      </section>

      <footer style="margin-top: 60px; border-top: 2px solid #333; padding-top: 30px;">
        <p style="text-align: center; color: #666; font-size: 14px;">
          Contrato generado electronicamente el ${new Date().toLocaleDateString("es-CO")}
        </p>
        <p style="text-align: center; color: #666; font-size: 14px;">
          ID de contrato: ${lease.id}
        </p>
      </footer>
    </div>
  `;
}
