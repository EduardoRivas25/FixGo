import { WebSocketServer } from 'ws';

const PORT = Number(process.env.WS_PORT || 8085);

const state = {
  available: true,
  requests: [
    {
      id: 'FG-2048',
      title: 'Pantalla rota de iPhone 13',
      category: 'Celular',
      device: 'iPhone 13',
      description:
        'Necesito cambiar la pantalla; se ve una línea verde y el cristal está quebrado. Busco una reparación con refacciones de buena calidad.',
      status: 'Cotización recibida',
      photos: 2,
      location: 'Colonia Del Valle, Benito Juárez',
      date: 'Hoy, 10:42',
      quote:
        'Puedo cambiar el módulo completo con pieza OLED compatible. Incluye instalación y garantía de 90 días.',
    },
    {
      id: 'FG-2043',
      title: 'Laptop se apaga al iniciar',
      category: 'Computadora',
      device: 'Lenovo IdeaPad 5',
      description:
        'Se apaga después de unos minutos. Necesito diagnóstico de batería y sistema de enfriamiento.',
      status: 'En reparación',
      photos: 1,
      location: 'Narvarte Poniente, Benito Juárez',
      date: 'Ayer, 16:20',
      quote: 'Diagnóstico y limpieza interna. Cambio de pasta térmica incluido.',
    },
    {
      id: 'FG-1982',
      title: 'Cambio de batería',
      category: 'Celular',
      device: 'Samsung Galaxy S22',
      description: 'La batería dura menos de dos horas y el equipo se calienta.',
      status: 'Entregado',
      photos: 2,
      location: 'Roma Sur, Cuauhtémoc',
      date: '12 nov',
      quote: 'Reemplazo de batería original con garantía de seis meses.',
    },
  ],
  notifications: [
    {
      id: 'NT-1',
      audience: 'cliente',
      title: 'Nueva cotización recibida',
      body: 'Pantalla rota de iPhone 13 · Carlos Méndez · Hace 12 minutos',
      requestId: 'FG-2048',
      read: false,
    },
    {
      id: 'NT-2',
      audience: 'cliente',
      title: 'Servicio actualizado',
      body: 'Laptop se apaga al iniciar · En reparación · Ayer',
      requestId: 'FG-2043',
      read: true,
    },
    {
      id: 'NT-3',
      audience: 'tecnico',
      title: 'Nueva solicitud compatible',
      body: 'Cambio de pantalla · Benito Juárez · Hace 12 minutos',
      requestId: 'FG-2048',
      read: false,
    },
    {
      id: 'NT-4',
      audience: 'tecnico',
      title: 'Tu perfil está listo',
      body: 'Completa tus especialidades y ubicación del local.',
      read: true,
    },
  ],
};

const wss = new WebSocketServer({ host: '0.0.0.0', port: PORT });

function broadcast(payload) {
  const data = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(data);
    }
  }
}

function applyEvent(event) {
  if (!event || typeof event.type !== 'string') return false;

  if (event.type === 'REQUEST_CREATED' && event.request) {
    state.requests = [
      event.request,
      ...state.requests.filter((r) => r.id !== event.request.id),
    ];
    state.notifications = [
      {
        id: `NT-${Date.now()}`,
        audience: 'tecnico',
        title: 'Nueva solicitud compatible',
        body: `${event.request.title} · ${event.request.location} · Ahora`,
        requestId: event.request.id,
        read: false,
      },
      ...state.notifications,
    ];
    return true;
  }

  if (event.type === 'QUOTE_SUBMITTED') {
    const item = state.requests.find((r) => r.id === event.id);
    if (!item) return false;
    item.quote = event.quote;
    item.quotePrice = event.quotePrice;
    item.quoteTime = event.quoteTime;
    item.status = 'Cotización recibida';
    state.notifications = [
      {
        id: `NT-${Date.now()}`,
        audience: 'cliente',
        title: 'Nueva cotización recibida',
        body: `${item.title} · ${event.technicianName || 'Carlos Méndez'} · Ahora`,
        requestId: item.id,
        read: false,
      },
      ...state.notifications,
    ];
    return true;
  }

  if (event.type === 'QUOTE_ACCEPTED') {
    const item = state.requests.find((r) => r.id === event.id);
    if (!item) return false;
    item.status = 'Aceptado';
    state.notifications = [
      {
        id: `NT-${Date.now()}`,
        audience: 'tecnico',
        title: 'Propuesta aceptada',
        body: `${item.title} · Trabajo asignado · Ahora`,
        requestId: item.id,
        read: false,
      },
      ...state.notifications,
    ];
    return true;
  }

  if (event.type === 'QUOTE_REJECTED') {
    const item = state.requests.find((r) => r.id === event.id);
    if (!item) return false;
    item.quote = undefined;
    item.quotePrice = undefined;
    item.quoteTime = undefined;
    item.status = 'Publicado';
    return true;
  }

  if (event.type === 'STATUS_UPDATED') {
    const item = state.requests.find((r) => r.id === event.id);
    if (!item) return false;
    item.status = event.status;
    state.notifications = [
      {
        id: `NT-${Date.now()}`,
        audience: 'cliente',
        title: 'Servicio actualizado',
        body: `${item.title} · ${event.status} · Ahora`,
        requestId: item.id,
        read: false,
      },
      ...state.notifications,
    ];
    return true;
  }

  if (event.type === 'RATING_SUBMITTED') {
    const item = state.requests.find((r) => r.id === event.id);
    if (!item) return false;
    item.rating = event.rating;
    item.review = event.review;
    return true;
  }

  if (event.type === 'TECH_AVAILABILITY') {
    state.available = Boolean(event.available);
    return true;
  }

  if (event.type === 'NOTIFICATION_READ') {
    const found = state.notifications.find((n) => n.id === event.id);
    if (found) found.read = true;
    return true;
  }

  return false;
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'SYNC_STATE', state }));

  ws.on('message', (raw) => {
    try {
      const parsed = JSON.parse(raw.toString());
      if (parsed.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG' }));
        return;
      }
      if (applyEvent(parsed)) {
        broadcast({ type: 'SYNC_STATE', state });
      }
    } catch {}
  });
});

console.log(`FixGo WebSocket escuchando en ws://0.0.0.0:${PORT}`);