# FixGo — plan de pantallas del frontend

## Propósito y límites

Este plan define **qué pantallas construir y qué debe mostrar cada una** para cliente, técnico y administrador. La primera etapa es solo frontend: navegación, diseño adaptable, formularios, validaciones visibles y datos de ejemplo. No incluye cuentas reales, base de datos, API, asignación real ni servidor WebSocket.

La app actual usa React Native, Expo, TypeScript y NativeWind. La misma experiencia debe poder adaptarse a móvil y web; para escritorio se diseñarán vistas de pantalla grande, aunque el empaquetado como aplicación instalable sigue pendiente. Los requisitos funcionales detallados están en [information.md](information.md).

> **Tiempo real:** un socket no comunica por sí solo tres aplicaciones cliente. Cuando exista backend, móvil, escritorio y web se conectarán al mismo servicio para recibir los mismos eventos. En esta etapa los avisos y cambios se **simulan con datos locales**; no se sincronizarán entre dispositivos.

## Mapa de navegación

```text
Acceso
├─ Iniciar sesión
└─ Registrarse → Elegir rol: cliente o técnico

Cliente
├─ Inicio / Mis solicitudes → Detalle → Cotizaciones → Perfil del técnico / mapa
│                                           └─ Aceptar cotización → Seguimiento → Calificación
├─ Nueva solicitud
├─ Notificaciones
└─ Perfil

Técnico
├─ Inicio / Disponibilidad
├─ Solicitudes disponibles → Detalle → Enviar cotización
├─ Mis trabajos → Detalle → Actualizar estado
├─ Notificaciones
└─ Perfil / Especialidades

Administrador
├─ Resumen
├─ Usuarios y técnicos → Detalle
├─ Solicitudes → Detalle
└─ Perfil
```

Para el prototipo se podrá entrar a cada rol con un **selector de vista de demostración**. Esto permite revisar todas las pantallas sin simular seguridad real. Ese selector debe quedar claramente marcado como herramienta temporal y retirarse cuando se implemente la autenticación.

## Pantallas comunes

| ID | Pantalla | Qué debe llevar | Acciones de frontend |
| --- | --- | --- | --- |
| C01 | Acceso | Nombre FixGo, explicación breve, botones **Iniciar sesión** y **Crear cuenta**. | Navegar a las pantallas respectivas. |
| C02 | Iniciar sesión | Correo, contraseña, opción para mostrarla, mensajes de validación y enlace a registro. | Validar campos y entrar al rol de demostración seleccionado. Sin autenticación real. |
| C03 | Registro | Nombre, correo, contraseña, confirmación y elección **Cliente / Técnico**. | Validar campos; si es técnico, llevar a especialidades. Sin guardar cuentas reales. |
| C04 | Notificaciones | Lista con tipo, mensaje, solicitud relacionada, fecha y estado leído/no leído; estado vacío. | Abrir el detalle correspondiente y marcar como leído solo en memoria. |
| C05 | Perfil | Nombre, contacto, rol y botón de cerrar sesión de demostración. | Editar datos locales; volver al acceso. |

La recuperación de contraseña queda fuera de este primer conjunto porque necesitaría un flujo externo real. Puede añadirse cuando se defina la autenticación.

## Pantallas del cliente

| ID | Pantalla | Qué debe llevar | Acciones de frontend |
| --- | --- | --- | --- |
| CL01 | Inicio / Mis solicitudes | Saludo, botón **Nueva solicitud**, tarjetas de solicitudes con equipo, categoría, fecha y estado; filtros **Activas / Finalizadas**; estado vacío. | Abrir solicitud o crear una nueva. |
| CL02 | Nueva solicitud | **Título obligatorio**, categoría **Celular / Computadora**, tipo de equipo, **descripción obligatoria de lo que se necesita hacer o reparar**, **al menos una fotografía del dispositivo o falla** y ubicación aproximada; resumen antes de publicar. | Validar título, descripción y foto; agregar/quitar y previsualizar imágenes; publicar la solicitud local de demostración. |
| CL03 | Detalle de solicitud | Folio, **título**, equipo, descripción completa, galería de fotos, ubicación aproximada, estado y cotizaciones recibidas. Tras aceptar una cotización, mostrar técnico asignado y línea de tiempo. | Ver fotos, abrir cotizaciones, perfil y ubicación del técnico; consultar progreso. |
| CL04 | Cotizaciones recibidas | Una tarjeta por propuesta con nombre del técnico, **cotización escrita completa**, fecha, precio y plazo solo si el técnico los proporcionó, estado de la propuesta y acceso al perfil/local del técnico. | Leer la propuesta, consultar al técnico y **aceptar o rechazar** con confirmación. Al aceptar, simular la asignación del trabajo a ese técnico. |
| CL05 | Calificar técnico | Referencia del trabajo entregado, nombre del técnico, **selector de 1 a 5 estrellas al estilo Uber**, valoración visible al tocar cada estrella y comentario opcional. | Enviar una sola calificación local y mostrar confirmación. **Solo aparece cuando el estado es Entregado**, nunca al marcar Terminado. |
| CL06 | Perfil y local del técnico | Nombre, especialidades, calificación promedio de ejemplo, dirección del local, horarios si existen y **mapa con marcador del local**. | Abrir desde una cotización o un trabajo asignado; ver dirección y marcador. Usar coordenadas de ejemplo en esta etapa. |

## Pantallas del técnico

| ID | Pantalla | Qué debe llevar | Acciones de frontend |
| --- | --- | --- | --- |
| T01 | Inicio | Estado **Disponible / No disponible**, especialidades, cantidad de solicitudes compatibles y trabajos activos. | Cambiar disponibilidad localmente; abrir solicitudes o trabajos. |
| T02 | Solicitudes disponibles | Trabajos publicados compatibles con **título**, categoría, tipo de equipo, descripción breve, miniatura de fotos, ubicación aproximada y fecha; estado vacío. | Filtrar por categoría y abrir detalle. |
| T03 | Detalle de solicitud disponible | **Título, descripción completa de lo que pide el cliente y galería de fotos del dispositivo**, categoría, tipo de equipo, ubicación aproximada y estado de la solicitud. | Ver fotos y pasar a **Enviar cotización**. No se asigna el trabajo al técnico por abrirlo o cotizarlo. |
| T04 | Enviar cotización | Solicitud relacionada, **campo obligatorio de texto libre para explicar la propuesta** (trabajo previsto, condiciones y observaciones); precio y tiempo estimado opcionales. | Validar el texto, revisar y enviar la cotización local. Mostrar que queda **Pendiente de respuesta del cliente**. |
| T05 | Mis trabajos | Trabajos cuya cotización **aceptó el cliente**, con estado y próxima acción; filtros **En curso / Terminados**. | Abrir detalle de trabajo. Las cotizaciones aún sin respuesta se muestran aparte, no como trabajos asignados. |
| T06 | Detalle de trabajo | Datos de solicitud y cliente, cotización, historial de estados y siguiente paso disponible. | Actualizar a **En diagnóstico**, **En reparación**, **Terminado** o **Entregado** en la simulación. |
| T07 | Perfil y especialidades | Datos del técnico, selección de **Celulares / Computadoras / Ambas**, disponibilidad, **nombre y dirección del local, ubicación en mapa con marcador ajustable** y vista previa de cómo lo verá el cliente. | Editar datos y mover/elegir el marcador de ejemplo; guardar localmente. |

## Pantallas del administrador

Estas vistas cubren RF-15. El documento base no las incluye en su lista explícita del MVP; para el frontend se prepararán en una fase posterior a los recorridos de cliente y técnico.

| ID | Pantalla | Qué debe llevar | Acciones de frontend |
| --- | --- | --- | --- |
| A01 | Resumen | Conteos de clientes, técnicos, solicitudes abiertas, en curso y terminadas; actividad reciente. | Navegar a listados filtrados. |
| A02 | Usuarios y técnicos | Tabla o lista adaptable con nombre, correo, rol, especialidades si aplica y estado de cuenta; búsqueda y filtros. | Abrir detalle y simular cambio de estado de cuenta. |
| A03 | Detalle de usuario | Perfil, rol, disponibilidad del técnico y solicitudes asociadas. | Consultar información y simular una acción administrativa con confirmación. |
| A04 | Solicitudes | Tabla o lista con folio, categoría, cliente, técnico asignado, estado y fecha; búsqueda y filtros. | Abrir detalle. |
| A05 | Detalle de solicitud | Datos de solicitud, cotización, técnico, línea de tiempo y estado actual. | Supervisar el caso; las acciones de intervención se definirán más adelante. |

Gestión de categorías y reportes se dejan fuera de este plan básico porque aún no hay operaciones definidas para ellos.

## Momentos que usarán WebSocket después

| Evento futuro | Pantallas que se actualizarán | Comportamiento que se puede simular ahora |
| --- | --- | --- |
| `solicitud.creada` | Técnico: T01, T02 y C04. Administrador: A01 y A04. | Añadir una solicitud de ejemplo y mostrar un aviso. |
| `solicitud.asignada` | Cliente: CL01, CL03 y C04. Técnico: T02, T05 y C04. Administrador: A01 y A04. | Se produce **después de que el cliente acepta una cotización**; mover la solicitud a trabajo activo. |
| `cotizacion.enviada` | Cliente: CL03, CL04 y C04. | Mostrar la propuesta escrita de ejemplo y una notificación. |
| `cotizacion.respondida` | Técnico: T04, T05 y C04. Administrador: A04. | Cambiar la etiqueta a aceptada o rechazada y avisar al técnico. |
| `servicio.estado_actualizado` | Cliente: CL01, CL03 y C04. Técnico: T05, T06. Administrador: A01, A04 y A05. | Actualizar la línea de tiempo y mostrar un aviso. |

Los formularios y cambios de datos futuros usarán la API; el socket servirá para **avisar** a las otras sesiones. El servidor deberá decidir quién recibe cada evento y confirmar de forma exclusiva la primera cotización aceptada, evitando asignaciones dobles. El frontend solo mostrará el resultado; la simulación local no garantiza esa regla.

## Estados visibles del prototipo

Para diseñar las pantallas se usarán ejemplos de: **Publicado / Esperando cotizaciones**, **Cotización recibida**, **Aceptado**, **En diagnóstico**, **En reparación**, **Terminado** y **Entregado**. **Terminado** significa que el técnico concluyó la reparación; **Entregado** significa que el cliente ya recibió el equipo y puede calificar. La propuesta también usa “Solicitado” y “Pendiente de asignación”; antes de conectar el backend habrá que unificar los nombres y fijar las transiciones permitidas.

Cada listado y detalle debe contemplar al menos: contenido normal, lista vacía, carga visual y error de demostración. Los botones que aún no tengan lógica real mostrarán una respuesta clara de **simulación**, sin aparentar que la operación se guardó en un servidor.

## Adaptación por plataforma

- **Móvil:** navegación inferior o por secciones principales, formularios de una columna y tarjetas; acciones prioritarias fáciles de alcanzar.
- **Web y escritorio:** menú lateral, tablas cuando haya espacio, panel de detalle junto al listado y formularios con ancho limitado para facilitar la lectura.
- **Las tres vistas:** mismas reglas, nombres de estados, componentes reutilizables y datos de ejemplo. Cambia la distribución, no el flujo.

## Orden sugerido de construcción del frontend

1. Diseño base, navegación y pantallas comunes C01–C05.
2. Recorrido de cliente CL01–CL06 con datos locales, incluidas fotos, cotización escrita, mapa y estrellas.
3. Recorrido de técnico T01–T07 y simulación de solicitud → cotización → entrega.
4. Notificaciones simuladas y estados vacíos, de carga y de error.
5. Vistas de administrador A01–A05.
6. Revisión de los recorridos en tamaños de móvil, navegador y escritorio.

**Criterio de terminado de esta etapa:** se puede publicar una solicitud de ejemplo con título, descripción y fotos; verla como técnico y enviar una cotización escrita; aceptarla como cliente; consultar el local del técnico en el mapa; avanzar el trabajo hasta **Entregado** y calificarlo con estrellas. También se pueden consultar las vistas de administración y comprobar la adaptación visual, todo sin depender de un backend.
