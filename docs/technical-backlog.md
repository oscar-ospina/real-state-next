# Backlog técnico — RealState

Basado en `ROADMAP.md` y aterrizado sobre el estado actual del repo al commit `a90622b`.

## Estado actual del repo

Ya existe base funcional para varias piezas del MVP:
- autenticación y roles (`admin`, `landlord`, `tenant`),
- publicación de propiedades,
- estados de propiedad (`draft`, `pending_review`, `approved`, `rejected`),
- documentos del inmueble y del usuario en schema,
- panel admin básico para revisión,
- flujo de arriendo multi-step,
- contrato base,
- OTP de 6 dígitos,
- pagos/Wompi,
- soporte de imágenes y video.

Eso cambia la prioridad: el trabajo no es “empezar de cero”, sino **cerrar huecos, endurecer reglas de negocio y convertir el flujo actual en MVP operable**.

---

## Corte MVP vs post-MVP

### Entra en MVP
- publicación con validaciones documentales mínimas,
- revisión manual operable de publicaciones,
- clasificación clara del publicador,
- solicitud de arriendo recuperable,
- evaluación básica de postulantes por arrendador,
- contrato marco generado desde variables reales,
- firma OTP con trazabilidad,
- valor inicial legalmente consistente,
- flujo end-to-end dentro de la plataforma.

### Sale de MVP
- automatización documental avanzada,
- antifraude fuerte asistido por terceros,
- scoring avanzado,
- negociación sofisticada del canon,
- contrato “inteligente” con eventos programados,
- monetización promocionada,
- recorridos virtuales y controles avanzados de calidad multimedia.

---

## Épicas priorizadas

## E1. Publicación y verificación documental
**Objetivo:** que una propiedad no llegue al marketplace sin la documentación mínima y sin rol de publicador claro.

**Estado actual:** parcialmente implementado.

### Tareas MVP
- [ ] Hacer obligatoria la matriz de documentos por `publisherRole`:
  - `owner` → escritura pública + certificado de tradición.
  - `mandatario` → escritura pública + certificado de tradición + contrato de mandato.
- [ ] Validar en backend que no se pueda enviar a revisión una propiedad incompleta.
- [ ] Bloquear publicación si faltan documentos obligatorios.
- [ ] Mostrar checklist visible en UI antes de “Enviar a revisión”.
- [ ] Guardar metadata útil por documento: tipo, nombre, tamaño, fecha de carga.
- [ ] Definir reglas mínimas de formato/tamaño por archivo.
- [ ] Mostrar estado documental en vista de propiedad y panel admin.

### Dependencias
- Upload estable.
- Reglas compartidas de validación frontend/backend.

### Entrega esperada
- Ninguna propiedad llega a `pending_review` sin documentos requeridos.

---

## E2. Operación interna de aprobación manual
**Objetivo:** que el equipo pueda aprobar/rechazar propiedades con criterio y trazabilidad.

**Estado actual:** parcialmente implementado.

### Tareas MVP
- [ ] Revisar el flujo admin completo de aprobación/rechazo extremo a extremo.
- [ ] Exigir motivo de rechazo cuando el estado pase a `rejected`.
- [ ] Mostrar documentos y datos del publicador en una sola vista de revisión.
- [ ] Registrar historial mínimo de revisión:
  - quién revisó,
  - cuándo,
  - decisión,
  - motivo.
- [ ] Agregar filtros por estado en panel admin.
- [ ] Notificar al publicador si su propiedad fue aprobada o rechazada.

### Dependencias
- E1 cerrada o suficientemente estable.
- Sesión con rol admin.

### Entrega esperada
- Backoffice mínimo pero utilizable para operar inventario real.

---

## E3. Modelo de propiedad y cumplimiento de negocio
**Objetivo:** que el dominio refleje reglas reales del negocio de arriendo.

**Estado actual:** parcialmente implementado.

### Tareas MVP
- [ ] Auditar que no sobreviva ninguna referencia funcional o textual a “depósito”.
- [ ] Normalizar el concepto `initialFeeAmount` y su copy visible como “valor inicial” / “cargo de estudio”.
- [ ] Definir qué parte del canon es editable, propuesta o acordada.
- [ ] Revisar si `monthlyRent`, `proposedRent` e `initialFeeAmount` cubren el flujo real sin ambigüedad.
- [ ] Documentar reglas de negocio en código y docs.

### Dependencias
- Revisión legal/negocio del naming final.

### Entrega esperada
- Modelo consistente con el roadmap y sin contradicciones legales obvias.

---

## E4. Solicitud de arriendo recuperable
**Objetivo:** que un arrendatario pueda iniciar, pausar y retomar una postulación sin perder avance.

**Estado actual:** bastante adelantado.

### Tareas MVP
- [ ] Verificar que el lease se retome correctamente desde cualquier paso permitido.
- [ ] Asegurar persistencia de datos parciales por paso.
- [ ] Manejar edge cases:
  - lease ya rechazado,
  - propiedad ya no disponible,
  - tenant intentando duplicar proceso,
  - landlord intentando contratar su propia propiedad.
- [ ] Añadir tests del flujo multi-step.
- [ ] Mostrar estado de avance al usuario con copy claro.

### Dependencias
- E3 consistente.

### Entrega esperada
- Flujo confiable para completar postulaciones reales.

---

## E5. Perfil y validación básica del arrendatario
**Objetivo:** capturar información suficiente para estudio inicial y reducir fraude básico.

**Estado actual:** parcialmente implementado.

### Tareas MVP
- [ ] Validar obligatoriedad y calidad mínima de datos del `tenantProfile`.
- [ ] Completar carga de documentos de identidad del usuario en el flujo correcto.
- [ ] Conectar documentos de identidad con la revisión del arrendador/admin cuando aplique.
- [ ] Definir estados simples de verificación del arrendatario.
- [ ] Mostrar resumen legible del postulante al arrendador.

### Dependencias
- Upload de documentos.
- E4 estable.

### Entrega esperada
- El arrendador puede evaluar candidatos con información básica y consistente.

---

## E6. Selección de postulantes por arrendador
**Objetivo:** que el arrendador revise múltiples candidatos y tome una decisión dentro de la plataforma.

**Estado actual:** implementado de forma inicial, necesita cierre operativo.

### Tareas MVP
- [ ] Verificar que un landlord pueda ver todos los leases asociados a una propiedad.
- [ ] Mejorar resumen comparativo de postulantes.
- [ ] Permitir aprobar/rechazar con notas internas o razón visible según caso.
- [ ] Asegurar transición correcta de estados del lease.
- [ ] Definir qué pasa automáticamente con otros postulantes cuando uno es aceptado.

### Dependencias
- E4 y E5.

### Entrega esperada
- Decisión de selección resuelta dentro del sistema, sin sacar al usuario del flujo.

---

## E7. Contrato marco parametrizado
**Objetivo:** generar un contrato útil, consistente y editable desde datos reales del proceso.

**Estado actual:** existe base de template.

### Tareas MVP
- [ ] Auditar template(s) actuales contra variables del negocio.
- [ ] Definir set mínimo de variables obligatorias:
  - partes,
  - inmueble,
  - canon,
  - valor inicial,
  - fechas,
  - tipo de contrato.
- [ ] Garantizar que el contrato renderice con datos completos o falle con validación clara.
- [ ] Versionar el contenido contractual generado por lease.
- [ ] Separar claramente contrato de vivienda vs comercial si el negocio ya lo exige.

### Dependencias
- E3.
- E4/E5 con datos suficientes.

### Entrega esperada
- Contrato trazable por lease, no solo un template estático.

---

## E8. Firma OTP y trazabilidad
**Objetivo:** cerrar la firma inicial con evidencia mínima y control de estados.

**Estado actual:** implementado de forma base.

### Tareas MVP
- [ ] Confirmar vigencia, reintentos, expiración y single-use de OTP.
- [ ] Registrar evento de solicitud, envío, validación y uso.
- [ ] Asociar firma a usuario, lease y timestamp de forma verificable.
- [ ] Revisar si falta firma/aceptación del lado arrendador o solo respuesta.
- [ ] Mejorar manejo de errores y reenvío de código.

### Dependencias
- E7.

### Entrega esperada
- Evidencia básica de firma inicial, suficiente para MVP interno.

---

## E9. Multimedia y ficha del inmueble
**Objetivo:** que el usuario pueda decidir dentro del producto sin depender de visita física inmediata.

**Estado actual:** adelantado.

### Tareas MVP
- [ ] Verificar reproducción de video en publicación y detalle.
- [ ] Asegurar orden y principalidad de medios.
- [ ] Definir mínimo de contenido para publicar (por ejemplo, al menos 1 imagen).
- [ ] Corregir vacíos de UX en galería y administración de medios.

### Dependencias
- E1.

### Entrega esperada
- Ficha de propiedad suficiente para soportar decisión digital básica.

---

## E10. Notificaciones y estados visibles
**Objetivo:** que cada actor entienda qué pasó y qué sigue.

**Estado actual:** probablemente incompleto.

### Tareas MVP
- [ ] Notificar cambios relevantes de propiedad: enviada, aprobada, rechazada.
- [ ] Notificar cambios relevantes de lease: iniciado, pendiente de firma, aprobado, rechazado.
- [ ] Mostrar timeline/estado actual dentro de dashboard.
- [ ] Estandarizar textos de estado para landlord, tenant y admin.

### Dependencias
- E2, E6, E8.

### Entrega esperada
- Menos fricción operativa y menos soporte manual.

---

## E11. Hardening técnico del MVP
**Objetivo:** que el flujo ya construido no se rompa al empezar uso real.

**Estado actual:** necesario antes de escalar.

### Tareas MVP
- [ ] Cubrir con tests los flujos críticos:
  - publicación,
  - envío a revisión,
  - aprobación/rechazo,
  - inicio de lease,
  - verificación tenant,
  - contrato,
  - OTP.
- [ ] Añadir guards de autorización por rol en rutas críticas.
- [ ] Validar transiciones de estado en backend, no solo en UI.
- [ ] Revisar idempotencia de endpoints sensibles.
- [ ] Registrar errores operativos clave.
- [ ] Crear seed/demo que cubra escenarios admin-landlord-tenant.

### Dependencias
- Todas las épicas MVP tocan esta.

### Entrega esperada
- MVP operable sin depender de “funciona mientras nadie haga algo raro”.

---

## Orden recomendado de ejecución

### Bloque 1 — cerrar publicación operable
1. E1. Publicación y verificación documental
2. E2. Operación interna de aprobación manual
3. E9. Multimedia y ficha del inmueble
4. E3. Modelo de propiedad y cumplimiento de negocio

### Bloque 2 — cerrar arriendo operable
5. E4. Solicitud de arriendo recuperable
6. E5. Perfil y validación básica del arrendatario
7. E6. Selección de postulantes por arrendador
8. E7. Contrato marco parametrizado
9. E8. Firma OTP y trazabilidad
10. E10. Notificaciones y estados visibles

### Bloque 3 — endurecimiento
11. E11. Hardening técnico del MVP

---

## Backlog priorizado por sprint

## Sprint 1 — cerrar inventario confiable
- [ ] Matriz obligatoria de documentos por rol de publicador.
- [ ] Validación backend al enviar a revisión.
- [ ] Checklist UI de documentos.
- [ ] Motivo obligatorio de rechazo.
- [ ] Vista admin consolidada con documentos + datos del publicador.
- [ ] Definir mínimo de medios para publicar.

## Sprint 2 — cerrar postulación operable
- [ ] Persistencia/retoma robusta del lease.
- [ ] Carga de documentos de identidad del tenant.
- [ ] Resumen de postulante para landlord.
- [ ] Selección de candidato y resolución de otros postulantes.

## Sprint 3 — cerrar formalización
- [ ] Contrato parametrizado por lease.
- [ ] Naming/legal de valor inicial.
- [ ] Trazabilidad completa de OTP.
- [ ] Estados visibles y notificaciones principales.

## Sprint 4 — endurecimiento
- [ ] Tests de happy path y casos límite.
- [ ] Guards/autorización.
- [ ] Validación estricta de transiciones.
- [ ] Instrumentación mínima de errores.

---

## Riesgos que pueden bloquear el MVP
- definición legal insuficiente del “valor inicial”,
- ambigüedad entre aprobación de propiedad vs aprobación de lease,
- falta de historial/auditoría mínima en decisiones admin,
- flujo de tenant sin documentos de identidad realmente conectados,
- contrato generado con datos incompletos,
- OTP correcto en UI pero débil en evidencia operativa.

---

## Primera feature recomendada después de este backlog

La primera feature del MVP que conviene atacar en Claude Code es:

**"Cerrar publicación verificable de inmuebles"**

Incluye:
- validación obligatoria de documentos por `publisherRole`,
- bloqueo de envío a revisión si faltan documentos,
- checklist visible en `new-property`,
- endurecimiento del flujo admin de aprobación/rechazo.

Es la mejor siguiente pieza porque:
- aterriza el roadmap en una capacidad core del negocio,
- reduce fraude desde el inicio,
- destraba inventario confiable,
- aprovecha bastante código ya existente en el repo.
