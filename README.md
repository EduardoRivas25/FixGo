<div align="center">

# 🔧 FixGo

### Reparaciones más cerca de ti

Conectamos a personas que necesitan reparar sus **celulares o computadoras** con técnicos disponibles y especializados.

**React Native · Expo · TypeScript · NativeWind**

</div>

---

## ¿Qué es FixGo?

FixGo es una aplicación en desarrollo para solicitar, cotizar y dar seguimiento a servicios de reparación, mantenimiento y soporte técnico. Un cliente describe el problema de su equipo; los técnicos compatibles reciben la solicitud, pueden atenderla y mantienen informado al cliente hasta la entrega.

El objetivo es ofrecer la experiencia en **móvil y web**, compartiendo código. La versión de **escritorio** forma parte del objetivo del proyecto, pero su empaquetado aún está por definir.

> **Estado actual:** plantilla inicial en blanco. Las funciones descritas abajo representan el alcance previsto; todavía no están implementadas.

## ✨ Funciones previstas

| Cliente | Técnico | Administrador |
| --- | --- | --- |
| Crear solicitudes de celular o computadora | Indicar especialidades y disponibilidad | Supervisar cuentas y solicitudes |
| Adjuntar fotos y consultar el estado | Recibir solicitudes compatibles | Gestionar usuarios y técnicos |
| Aceptar o rechazar cotizaciones | Aceptar, rechazar y cotizar trabajos | Consultar la actividad de la plataforma |
| Calificar al técnico al finalizar | Actualizar el progreso del servicio | |

### Flujo de un servicio

```text
Solicitud → Técnicos compatibles → Aceptación / cotización
          → Diagnóstico → Reparación → Entrega → Calificación
```

Las nuevas solicitudes y los cambios importantes se comunicarán en tiempo real. Las operaciones habituales se harán mediante una API; los WebSockets se reservarán para los avisos que los necesiten.

## 🧱 Tecnología actual

- **Expo y React Native** para la aplicación.
- **TypeScript** para el código.
- **NativeWind y Tailwind CSS** para estilos con `className`.
- **React Native Web** para ejecutar la misma base en el navegador.

El backend, la base de datos y la solución de escritorio aún no están implementados ni elegidos. La arquitectura prevista separa usuarios, solicitudes, asignación, cotizaciones y notificaciones.

## 🚀 Iniciar el proyecto

Necesitas Node.js y npm. Desde la carpeta del proyecto:

```bash
npm install
npm start
```

Para abrirlo directamente en una plataforma:

```bash
npm run web      # navegador
npm run android  # emulador o dispositivo Android
npm run ios      # simulador iOS en macOS
```

La pantalla inicial está intencionalmente vacía. Puedes empezar a editar [`App.tsx`](App.tsx); la configuración de estilos está en [`tailwind.config.js`](tailwind.config.js) y [`global.css`](global.css).

## 📌 Alcance de la primera versión

El MVP busca demostrar el recorrido completo: registro, perfiles de cliente y técnico, solicitudes, búsqueda de técnicos compatibles, asignación sin duplicados, cotización básica, seguimiento, avisos en tiempo real y calificación final.

Pagos en línea, inteligencia artificial, chat avanzado y nuevas categorías quedan para versiones posteriores. Las decisiones y requisitos detallados están en [`information.md`](information.md).

## 🎓 Contexto

FixGo nace como proyecto de **Sistemas Distribuidos** del Instituto Tecnológico Superior de Uruapan. Su diseño busca mostrar comunicación entre componentes, procesamiento concurrente y notificaciones en tiempo real mediante una aplicación útil para clientes y técnicos.
