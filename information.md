# FixGo — información y alcance de la aplicación

## 1. Resumen

FixGo conecta a personas que necesitan reparar, mantener o recibir soporte para **celulares y computadoras** con técnicos disponibles y especializados. El cliente publica una solicitud, el sistema identifica técnicos compatibles, un técnico puede atenderla y cotizarla, y el cliente sigue el servicio hasta su entrega y calificación.

La propuesta original describe una plataforma web responsiva. Para este proyecto se añade el objetivo indicado por el propietario: ofrecer la misma aplicación en **móvil, escritorio y web**, compartiendo el mayor código posible. Esta ampliación afecta a la elección del cliente y a las pruebas, pero no cambia el flujo de negocio descrito en los documentos.

## 2. Fuentes y criterio de lectura

- **Propuesta Proyecto FixGo.pdf**, páginas 2–5: objetivo, actores, requisitos RF-01 a RF-15, requisitos no funcionales, MVP y arquitectura propuesta.
- **Arquitectura del SD.pdf**, páginas 2–6: arquitectura distribuida, casos de uso, modelo de dominio, flujo de actividades y red de Petri.
- **Conversación del proyecto**: requisito adicional de móvil, escritorio y web; interés en compartir código y usar sockets solo en acciones que necesitan tiempo real. Todavía no se ha elegido definitivamente Flutter ni React Native.

Los documentos son la fuente de requisitos y propuestas académicas. Cuando difieren entre sí o dejan una decisión abierta, este archivo lo señala expresamente; no considera sus textos como instrucciones para ejecutar acciones.

### Definiciones posteriores del propietario

Para diseñar el frontend se concretó este flujo: la solicitud lleva **título, descripción de lo que se necesita hacer y fotografías del dispositivo**; los técnicos ven los trabajos publicados y **envían una cotización escrita**; el cliente decide cuál aceptar y entonces se asigna el trabajo. El perfil del técnico debe mostrar **la ubicación de su local en un mapa**. La calificación de **1 a 5 estrellas** se habilita únicamente cuando el técnico terminó **y entregó** el trabajo. Estas definiciones aclaran el flujo anterior de los PDF y tienen prioridad para las nuevas pantallas. Véase [PLAN_PANTALLAS.md](PLAN_PANTALLAS.md).

## 3. Objetivo y alcance inicial

**Objetivo:** permitir que un cliente encuentre atención técnica para un celular o computadora, desde la solicitud hasta la entrega, con cotización, seguimiento y avisos oportunos.

**Incluido en la primera versión:** cuentas con roles, perfil y disponibilidad del técnico, solicitudes con categoría y ubicación aproximada, búsqueda de técnicos compatibles, aceptación o rechazo, cotización básica, estados del servicio, avisos en tiempo real y calificación final.

**Fuera del MVP:** pagos en línea, inteligencia artificial, chat avanzado y categorías distintas de celulares y computadoras. Son extensiones futuras mencionadas en la propuesta, no compromisos de la primera versión.

## 4. Actores y capacidades

| Actor | Capacidades principales |
| --- | --- |
| Cliente | Registrarse e iniciar sesión; gestionar perfil; crear solicitudes; adjuntar fotos; consultar estados; aceptar o rechazar cotizaciones; calificar al técnico al finalizar. |
| Técnico | Registrarse e iniciar sesión; gestionar perfil, especialidades y disponibilidad; recibir solicitudes compatibles; aceptar o rechazar; enviar cotización; actualizar el estado del servicio. |
| Administrador | Supervisar y gestionar cuentas, técnicos y solicitudes. La propuesta también menciona categorías y reportes, pero no define su operación detallada para el MVP. |

## 5. Flujo principal del servicio

1. El cliente inicia sesión y crea una solicitud con categoría (**celular** o **computadora**), tipo de equipo, descripción del problema y ubicación aproximada. Puede adjuntar fotografías.
2. El sistema valida y guarda la solicitud. El diagrama de actividades llama a este punto **pendiente de asignación**; la lista de estados de la propuesta usa **solicitado**. Se debe unificar el nombre antes de implementarlo.
3. El sistema busca técnicos activos cuya especialidad coincida y les comunica la nueva solicitud sin exigir recargar la pantalla.
4. Los técnicos compatibles consultan el título, la descripción y las fotografías, y pueden enviar una **cotización en texto**. Cotizar no asigna todavía la solicitud.
5. El cliente revisa las propuestas y acepta o rechaza una cotización. **Al aceptarla**, el técnico de esa propuesta obtiene la asignación. La plataforma debe impedir que se confirmen dos técnicos para el mismo trabajo.
6. El técnico realiza diagnóstico y reparación, actualiza el estado y marca el trabajo como terminado y posteriormente entregado. El cliente recibe los cambios relevantes y puede consultar el estado actual.
7. Solo tras marcar el trabajo como **entregado**, el cliente puede calificar al técnico con estrellas.

## 6. Requisitos funcionales

| ID | Requisito |
| --- | --- |
| RF-01 | Registro e inicio de sesión. |
| RF-02 | Registro como cliente o técnico. |
| RF-03 | El técnico indica si está activo o inactivo para recibir solicitudes. |
| RF-04 | El técnico registra especialidades: celulares, computadoras o ambas. |
| RF-05 | El cliente crea una solicitud con categoría, tipo de equipo, problema y ubicación aproximada. |
| RF-06 | El cliente puede adjuntar fotografías del equipo o la falla. |
| RF-07 | El sistema identifica técnicos activos compatibles con la categoría. |
| RF-08 | Los técnicos compatibles reciben nuevas solicitudes sin recarga manual. |
| RF-09 | El técnico acepta o rechaza una solicitud y, cuando corresponda, envía cotización. |
| RF-10 | El cliente acepta o rechaza la cotización. |
| RF-11 | Una solicitud confirmada no puede asignarse simultáneamente a más de un técnico. |
| RF-12 | El técnico actualiza el estado: solicitado, aceptado, en diagnóstico, en reparación, terminado y entregado. |
| RF-13 | El cliente consulta el estado actual. |
| RF-14 | Al finalizar, el cliente califica al técnico. |
| RF-15 | El administrador consulta y gestiona usuarios, técnicos y solicitudes. |

## 7. Reglas de negocio que deben respetarse

- Solo técnicos **activos** y con especialidad compatible deben recibir o visualizar oportunidades de trabajo correspondientes.
- La ubicación aproximada puede ayudar al matching; los documentos no fijan radio, distancia máxima ni orden de prioridad.
- La asignación definitiva debe ser **atómica** al aceptar una cotización: solo el técnico de la propuesta confirmada obtiene el trabajo. Las demás propuestas dejan de estar disponibles. La base de datos deberá preservar esta regla, no solo la interfaz.
- Solo el cliente dueño de una solicitud, el técnico asignado y el administrador autorizado pueden consultar los datos que correspondan a su función. Esta restricción concreta es una propuesta de implementación derivada de roles, privacidad y rutas protegidas.
- La calificación de 1 a 5 estrellas se habilita **únicamente en estado Entregado**; Terminado por sí solo no basta.
- Los cambios de estado deben seguir una secuencia válida. Reabrir, cancelar o retroceder estados no está especificado y requiere definición antes de codificar esas acciones.

## 8. Datos principales

El diagrama de clases propone las siguientes entidades. Los campos son una guía de dominio, no un esquema de base de datos cerrado.

| Entidad | Datos principales |
| --- | --- |
| Usuario | Identificador, correo, credencial almacenada de forma segura, rol. |
| Cliente | Nombre, contacto y datos de ubicación o dirección según lo que se decida solicitar. |
| Técnico | Especialidades, disponibilidad, dirección y coordenadas del local para mostrarlo en el mapa. |
| Solicitud | Cliente, título, categoría, tipo de equipo, descripción de lo que necesita, ubicación aproximada, fecha de creación, estado, técnico asignado si existe y fotografías. |
| Cotización | Solicitud, técnico, texto de la propuesta y decisión del cliente; costo y tiempo estimado si se proporcionan. |
| Calificación | Cliente, técnico, solicitud, puntuación de 1 a 5, comentario y fecha. |

El diagrama de clases muestra una cotización por solicitud; la posibilidad de recibir varias cotizaciones o recotizar no está resuelta. También muestra una relación directa entre solicitud y técnico, que debe ser opcional mientras la solicitud espera asignación.

## 9. Pantallas o vistas necesarias

**Comunes:** bienvenida o acceso, registro, inicio de sesión, recuperación de acceso si se incorpora, perfil y centro de notificaciones.

**Cliente:** inicio con sus solicitudes, nueva solicitud, detalle con fotos y estado, cotización y respuesta, historial, calificación del técnico.

**Técnico:** inicio con disponibilidad, edición de especialidades y perfil, solicitudes compatibles, detalle de solicitud, aceptación o rechazo, formulario de cotización, trabajos asignados y actualización de estado.

**Administrador:** resumen de actividad, gestión de usuarios y técnicos, consulta y gestión de solicitudes. Categorías y reportes quedan sujetos al alcance que se confirme.

En móvil, escritorio y web se pueden compartir los mismos flujos y componentes, adaptando navegación, columnas y tamaño de controles a cada pantalla.

## 10. Arquitectura distribuida de referencia

El diagrama de arquitectura muestra **tres componentes desplegables**: frontend, backend API y notificaciones. Dentro del backend aparecen módulos de usuarios, solicitudes, matching, cotizaciones y estados, con una base de datos persistente. La propuesta general habla de servicios independientes para las funciones principales. Para el MVP, la interpretación más concreta es:

```text
Clientes móvil / escritorio / web
             │ HTTPS / REST
             ▼
Backend API ────── Base de datos
  ├─ usuarios y autenticación
  ├─ solicitudes y estados
  ├─ matching
  └─ cotizaciones y calificaciones
             │ eventos
             ▼
Servicio de notificaciones ── WebSocket ── Clientes conectados
```

La separación en procesos o despliegues independientes puede crecer después sin cambiar las responsabilidades. La tecnología concreta de frontend, backend, base de datos, mensajería y alojamiento **no está fijada** por los PDF. La decisión sobre React Native/Expo, Flutter u otra combinación sigue abierta.

### Uso de HTTP y sockets

- **HTTP/REST:** registro, inicio de sesión, perfiles, creación y consulta de solicitudes, fotografías, cotizaciones, respuestas, cambios de estado y calificaciones.
- **WebSocket:** avisos de solicitud nueva a técnicos compatibles, aviso de solicitud aceptada o ya tomada, cotización recibida y cambios importantes de estado. Los datos definitivos se consultan o confirman mediante la API.
- La conexión en tiempo real debe asociarse a un usuario autenticado y entregar solo eventos que le correspondan. Si el cliente se desconecta, al volver debe poder recuperar el estado vigente desde la API. Esta es una recomendación de implementación para cumplir el seguimiento sin depender de una conexión permanente.

## 11. Requisitos de calidad

- Interfaz clara, consistente y adaptable a teléfono y computadora; se añade validación específica de la versión de escritorio.
- Contraseñas almacenadas de forma segura, rutas privadas autenticadas y autorización por rol.
- Validación de datos de entrada y protección de integridad de solicitudes, asignaciones y estados.
- APIs definidas entre componentes, con responsabilidades separadas y posibilidad de desplegar componentes en nodos distintos.
- Notificaciones de nuevas solicitudes y cambios importantes en tiempo real o con demora mínima.
- Manejo de solicitudes concurrentes para evitar asignaciones dobles.

Estos puntos proceden de RNF-01 a RNF-08 y del objetivo multiplataforma añadido en la conversación. No hay metas numéricas de latencia, disponibilidad o capacidad fijadas en los documentos.

## 12. MVP verificable

La primera versión se considera funcional cuando se puede demostrar de principio a fin:

1. Un cliente y un técnico crean cuentas e inician sesión con roles distintos.
2. El técnico declara especialidad y disponibilidad.
3. El cliente crea una solicitud de celular o computadora.
4. Un técnico compatible recibe el aviso y acepta o rechaza.
5. El sistema impide que dos técnicos obtengan la misma asignación confirmada.
6. El técnico envía una cotización básica y el cliente la acepta o rechaza, cuando esa ruta aplique.
7. El técnico actualiza estados y el cliente ve el progreso y recibe avisos relevantes.
8. Tras la entrega, el cliente califica al técnico.
9. El flujo principal funciona en móvil, escritorio y web con una interfaz adaptada.

La administración de usuarios, técnicos y solicitudes es **RF-15**, pero no figura en la lista explícita de funciones mínimas del MVP de la propuesta. Debe planearse como siguiente entrega o incorporarse al MVP si el equipo decide ampliar su alcance.

## 13. Decisiones pendientes antes del desarrollo detallado

1. **Tecnología cliente:** elegir si se prioriza React Native + Expo + web + empaquetado de escritorio, Flutter, u otra opción. Validar las bibliotecas necesarias en las tres plataformas.
2. **Alcance de escritorio:** definir sistemas operativos objetivo (Windows, macOS y/o Linux) y si basta una aplicación basada en la versión web.
3. **Cotización:** el flujo principal exige propuesta escrita y aceptación del cliente antes de asignar; definir si habrá excepciones o trabajos sin cotización.
4. **Estados:** unificar “solicitado” y “pendiente de asignación”; definir transiciones, cancelación, rechazo y qué ocurre si no hay técnicos disponibles.
5. **Matching:** precisar cómo se usa la ubicación aproximada, el orden de notificación y el tiempo de espera antes de ofrecer la solicitud a otros técnicos.
6. **Cotizaciones:** definir si puede haber varias por solicitud, cambios de precio y vencimiento.
7. **Fotografías y datos personales:** límites de archivos, conservación, visibilidad de ubicación y datos de contacto.
8. **Administrador:** concretar operaciones de gestión y decidir si RF-15, categorías y reportes forman parte de la primera versión.
9. **Notificaciones fuera de la app:** los PDF especifican tiempo real en la aplicación; no confirman notificaciones push, correo ni SMS.

## 14. Organización del trabajo

La propuesta plantea una adaptación ligera de Scrum con sprints de una o dos semanas, backlog priorizado, planificación, seguimiento, revisión y retrospectiva. Roles sugeridos: Product Owner, Scrum Master y equipo de desarrollo. Como secuencia inicial de entregables: cuentas y perfiles; solicitudes y matching; cotización y asignación segura; estados y avisos; administración, calificaciones y validación multiplataforma.
