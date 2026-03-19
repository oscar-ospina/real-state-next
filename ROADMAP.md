# Roadmap de Producto — RealState

Basado en la reunión del **23 de febrero de 2026**.

## 1. Visión / Resumen

RealState busca modernizar el mercado de arrendamiento inmobiliario en Colombia con un enfoque **digital-first**, reduciendo fricción, fraude y dependencia de intermediarios tradicionales.

La propuesta es:
- permitir publicación gratuita de inmuebles,
- verificar la legitimidad del anunciante y del inmueble,
- digitalizar el flujo de arrendamiento,
- permitir contratación sin necesidad de visitas físicas,
- ejecutar el contrato con soporte de validación, firma OTP y seguimiento posterior.

El enfoque actual debe mantenerse en el **MVP**, priorizando funcionalidad y flujo de negocio sobre detalles visuales secundarios.

---

## 2. Decisiones ya tomadas

### Publicación y verificación
- La publicación de propiedades requerirá una **aprobación manual inicial**.
- Para publicar se deben solicitar documentos de verificación del inmueble.
- Documentos clave:
  - escritura pública,
  - certificado de tradición,
  - contrato de mandato si publica un mandatario.
- No se cobrará inicialmente por cargar documentos; primero se busca generar confianza.
- En el futuro el proceso de verificación podría automatizarse.

### Flujo de arrendamiento
- Se elimina el concepto de **depósito**, por ser ilegal en contratos de arrendamiento según la conversación.
- Se reemplaza por un **valor inicial** o cargo destinado a cubrir verificación del arrendatario en centrales de riesgo.
- El flujo incluirá un **contrato marco genérico**.
- La firma del contrato se hará mediante **OTP de 6 dígitos enviado al celular**.
- La firma por OTP **no reemplaza** la validación de identidad.

### Validación de identidad
- Debe existir validación robusta de identidad para evitar fraude.
- Se plantea pedir fotos de la cédula desde etapas tempranas del proceso.
- Debe verificarse que quien firma coincide con quien figura en la documentación relevante.

### Modelo de producto
- La plataforma debe parecerse más a un modelo tipo **Airbnb**, donde el usuario decide con base en contenido digital.
- No se permitirá un flujo de “contactar” por fuera de la plataforma como camino principal.
- El objetivo es que la contratación ocurra **dentro de la herramienta**.

### Monetización inicial
- La publicación será gratuita.
- La monetización inicial se plantea vía **publicidad / mejor clasificación**.
- Se discutió una tarifa única asociada al canon, no necesariamente un porcentaje mensual.

---

## 3. Roadmap por fases

## Fase 1 — MVP

### Objetivo
Construir un flujo funcional y confiable para publicar inmuebles, recibir solicitudes y formalizar arrendamientos básicos dentro de la plataforma.

### Entregables clave
1. **Publicación de inmuebles con verificación documental**
   - formulario de publicación,
   - carga de escritura pública,
   - carga de certificado de tradición,
   - carga de contrato de mandato si aplica,
   - estado `pendiente de aprobación`.

2. **Revisión manual de publicaciones**
   - panel o flujo interno de aprobación/rechazo,
   - motivo de rechazo,
   - cambio de estado de publicación.

3. **Clasificación del anunciante**
   - propietario vs mandatario,
   - validación de capacidad/rol del publicador.

4. **Flujo básico de solicitud de arriendo**
   - iniciar solicitud,
   - retomar solicitud incompleta,
   - registrar datos del arrendatario,
   - capturar información necesaria para estudio.

5. **Contrato marco base**
   - borrador con variables principales,
   - cosa + precio como elementos esenciales,
   - lenguaje base listo para revisión.

6. **Firma por OTP**
   - envío de código,
   - validación de código,
   - registro de evento de firma.

7. **Carga de contenido multimedia del inmueble**
   - fotos,
   - videos (idealmente MP4),
   - sin bloquear inicialmente por orientación.

8. **Vista del arrendador sobre postulantes**
   - ver múltiples solicitantes,
   - revisar detalles antes de aceptar,
   - seleccionar candidato.

### Resultado esperado del MVP
- un inmueble puede publicarse,
- pasa por validación manual,
- un arrendatario puede postularse,
- el arrendador puede revisar candidatos,
- el contrato puede generarse y firmarse con un mecanismo inicial,
- el flujo ocurre dentro de la plataforma.

---

## Fase 2 — Consolidación operativa

### Objetivo
Reducir riesgo operativo y mejorar la calidad de la experiencia para escalar el producto.

### Entregables clave
1. **Validación de identidad reforzada**
   - documentos de identidad del arrendador y arrendatario,
   - validaciones antifraude,
   - revisión de coincidencia entre firmante y documentación.

2. **Automatización parcial de verificación documental**
   - reglas para documentos obligatorios,
   - checklist automática,
   - apoyo al proceso manual.

3. **Mejoras de calidad de publicaciones**
   - control mínimo de calidad de fotos/videos,
   - revisión manual o asistida,
   - lineamientos para publicaciones atractivas.

4. **Gestión contractual ampliada**
   - notificaciones de pagos,
   - renovaciones,
   - alertas de terminación,
   - seguimiento del contrato ejecutado.

5. **Negociación del canon / precios dinámicos**
   - propuesta de canon,
   - contraoferta,
   - registro del valor acordado.

---

## Fase 3 — Diferenciación y expansión

### Objetivo
Convertir la plataforma en una herramienta más inteligente y difícil de reemplazar.

### Oportunidades futuras
1. **Contrato inteligente**
   - automatización de recordatorios,
   - eventos sobre vigencia,
   - renovaciones,
   - hitos contractuales.

2. **Verificación automatizada del inmueble y del publicador**
   - reducción de carga operativa manual,
   - mayor velocidad de aprobación.

3. **Mejor experiencia visual**
   - recorridos virtuales,
   - contenidos de mayor calidad,
   - experiencias multimedia más inmersivas.

4. **Modelo avanzado de monetización**
   - ranking patrocinado,
   - servicios premium,
   - tarifas por valor agregado.

---

## 4. Requisitos funcionales

## Publicación de inmuebles
- Crear publicación de inmueble.
- Preguntar si el anunciante es:
  - propietario,
  - mandatario.
- Solicitar documentos según rol.
- Permitir subir fotos y videos.
- Marcar publicación como pendiente de aprobación.
- Permitir aprobación/rechazo manual.

## Flujo de arriendo
- Iniciar solicitud de arriendo.
- Retomar solicitud no finalizada.
- Registrar información del arrendatario.
- Permitir revisión del solicitante por parte del arrendador.
- Permitir selección entre varios solicitantes.
- Generar borrador contractual.
- Ejecutar firma OTP.
- Registrar estado del contrato.

## Contrato y seguimiento
- Generar contrato marco.
- Definir valor inicial en lugar de depósito.
- Registrar firma de las partes.
- Notificar eventos posteriores del contrato.

## Experiencia del producto
- Evitar el flujo de contacto externo como camino principal.
- Forzar la contratación dentro de la plataforma.
- Priorizar experiencia visual del inmueble.

---

## 5. Requisitos de negocio y legales

- Verificar legitimidad del publicador para evitar fraude.
- Solicitar escritura pública y certificado de tradición.
- Si publica un mandatario, solicitar contrato de mandato.
- El contrato debe contemplar sujetos plenamente capaces.
- Deben respetarse requisitos de existencia y validez del contrato.
- La firma es importante como formalidad, pero no sustituye validación de identidad.
- No usar la figura de depósito; usar un valor inicial/cargo asociado a verificación.
- La plataforma debe educar al usuario en transparencia contractual y regulación.

---

## 6. Riesgos abiertos

### Riesgo legal / regulatorio
- mal manejo del concepto de depósito,
- errores en formalidades del contrato,
- validación insuficiente de identidad o representación.

### Riesgo de fraude
- publicación por alguien que no es propietario,
- uso indebido por inmobiliarias o terceros,
- firma por persona distinta al titular real.

### Riesgo operativo
- dependencia inicial de revisión manual,
- posible cuello de botella en aprobación de publicaciones,
- baja calidad del contenido multimedia.

### Riesgo de producto
- inventario vacío o con baja calidad,
- dificultad para generar confianza sin validación fuerte,
- usuarios intentando salirse del flujo para contratar por fuera.

---

## 7. Backlog inicial priorizado

## Prioridad alta
1. Crear flujo de publicación con documentos obligatorios.
2. Modelar estados de publicación: draft / pending_review / approved / rejected.
3. Crear panel o vista mínima para aprobación manual.
4. Preguntar explícitamente si el publicador es propietario o mandatario.
5. Soportar carga de escritura pública, certificado de tradición y contrato de mandato.
6. Implementar flujo de solicitud de arriendo con posibilidad de retomar proceso.
7. Generar contrato marco base.
8. Implementar firma OTP de 6 dígitos.
9. Crear vista para que el arrendador vea y seleccione postulantes.
10. Reemplazar cualquier referencia a “depósito” por “valor inicial” o equivalente válido.

## Prioridad media
11. Carga y reproducción de videos en publicaciones.
12. Validación inicial de identidad con documentos del usuario.
13. Mejora de UX para revisión de detalles del solicitante antes de aceptar.
14. Notificaciones de ejecución del contrato.
15. Soporte inicial para negociación del canon.

## Prioridad futura
16. Automatización parcial de verificación documental.
17. Reglas de calidad para fotos y videos.
18. Contrato inteligente con notificaciones periódicas.
19. Mejor clasificación/pago promocionado para monetización.
20. Recorridos virtuales y experiencia visual avanzada.

---

## 8. Principios de ejecución

- Mantener el enfoque en el **MVP**.
- Priorizar flujo y validación sobre detalles cosméticos.
- Diseñar para reducir fraude desde el inicio.
- Obligar a que el valor principal ocurra dentro de la plataforma.
- Construir primero el flujo operativo mínimo; automatizar después.
