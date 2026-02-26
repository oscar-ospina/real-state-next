import type { Property, User, TenantProfile, Lease } from "@/lib/db/schema";

interface ContractData {
  property: Property;
  landlord: Pick<User, "id" | "name" | "email" | "phone">;
  tenant: Pick<User, "id" | "name" | "email">;
  tenantProfile: TenantProfile;
  lease: Lease;
}

export function generateCommercialLeaseContract(data: ContractData): string {
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
        <h1 style="font-size: 24px; margin-bottom: 10px;">CONTRATO DE ARRENDAMIENTO DE LOCAL COMERCIAL</h1>
        <p style="color: #666;">Codigo de Comercio - Colombia</p>
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
        <p>El ARRENDADOR da en arrendamiento al ARRENDATARIO el siguiente inmueble de uso comercial:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Inmueble:</strong> ${property.title}</p>
          <p><strong>Direccion:</strong> ${property.address}</p>
          <p><strong>Ciudad:</strong> ${property.city}${property.neighborhood ? `, ${property.neighborhood}` : ""}</p>
          <p><strong>Tipo:</strong> Local Comercial</p>
          <p><strong>Area:</strong> ${property.areaSqm ? `${property.areaSqm} m²` : "No especificada"}</p>
        </div>
      </section>

      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">USO DEL INMUEBLE</h2>
        <p>El inmueble arrendado se destinara exclusivamente para uso comercial, especificamente para el desarrollo de la actividad comercial indicada por el ARRENDATARIO: <strong>${tenantProfile.occupation}</strong>.</p>
        <p>El ARRENDATARIO no podra cambiar el uso del inmueble sin previa autorizacion escrita del ARRENDADOR.</p>
      </section>

      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">CONDICIONES ECONOMICAS</h2>
        <p><strong>Canon de arrendamiento mensual:</strong> ${formatCurrency(lease.monthlyRent)}</p>
        ${lease.initialFeeAmount ? `<p><strong>Valor inicial:</strong> ${formatCurrency(lease.initialFeeAmount)}</p>` : ""}
        <p>El pago del canon se realizara dentro de los primeros cinco (5) dias de cada mes mediante transferencia bancaria o el metodo acordado por las partes.</p>
        <p style="font-size: 14px; color: #666; font-style: italic; margin-top: 10px;">El canon de arrendamiento sera reajustado anualmente de acuerdo con el IPC certificado por el DANE.</p>
      </section>

      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">DURACION</h2>
        <p><strong>Fecha de inicio:</strong> ${formatDate(lease.startDate)}</p>
        <p><strong>Fecha de finalizacion:</strong> ${formatDate(lease.endDate)}</p>
        <p>El contrato tendra una duracion inicial de doce (12) meses, renovable automaticamente por periodos iguales, salvo manifestacion en contrario de cualquiera de las partes con una antelacion minima de tres (3) meses.</p>
      </section>

      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">OBLIGACIONES DEL ARRENDATARIO</h2>
        <ol style="padding-left: 20px;">
          <li style="margin-bottom: 10px;">Pagar puntualmente el canon de arrendamiento y los servicios publicos.</li>
          <li style="margin-bottom: 10px;">Destinar el inmueble unicamente al uso comercial autorizado.</li>
          <li style="margin-bottom: 10px;">Mantener el inmueble en buen estado de conservacion.</li>
          <li style="margin-bottom: 10px;">Realizar las reparaciones locativas necesarias.</li>
          <li style="margin-bottom: 10px;">Permitir al arrendador realizar inspecciones previo aviso de 48 horas.</li>
          <li style="margin-bottom: 10px;">No subarrendar ni ceder el contrato sin autorizacion escrita del arrendador.</li>
          <li style="margin-bottom: 10px;">Cumplir con todas las normas municipales y sanitarias aplicables a su actividad comercial.</li>
          <li style="margin-bottom: 10px;">Obtener y mantener vigentes todos los permisos y licencias necesarios para su actividad.</li>
        </ol>
      </section>

      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">OBLIGACIONES DEL ARRENDADOR</h2>
        <ol style="padding-left: 20px;">
          <li style="margin-bottom: 10px;">Entregar el inmueble en condiciones aptas para el uso comercial pactado.</li>
          <li style="margin-bottom: 10px;">Realizar las reparaciones estructurales necesarias.</li>
          <li style="margin-bottom: 10px;">Respetar el uso pacifico del inmueble por parte del arrendatario.</li>
          <li style="margin-bottom: 10px;">Garantizar que el inmueble cuenta con los servicios publicos basicos.</li>
        </ol>
      </section>

      <section style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">TERMINACION DEL CONTRATO</h2>
        <p>El contrato podra terminarse por las siguientes causales:</p>
        <ol style="padding-left: 20px;">
          <li style="margin-bottom: 10px;">Por mutuo acuerdo de las partes.</li>
          <li style="margin-bottom: 10px;">Por vencimiento del termino pactado sin renovacion.</li>
          <li style="margin-bottom: 10px;">Por incumplimiento de cualquiera de las obligaciones contractuales.</li>
          <li style="margin-bottom: 10px;">Por falta de pago del canon de arrendamiento por dos (2) meses consecutivos.</li>
        </ol>
        <p style="margin-top: 10px;">Para la terminacion anticipada, la parte interesada debera notificar a la otra con una antelacion minima de tres (3) meses.</p>
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
