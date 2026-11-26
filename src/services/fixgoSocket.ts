import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type Status =
  | 'Publicado'
  | 'Cotización recibida'
  | 'Aceptado'
  | 'En diagnóstico'
  | 'En reparación'
  | 'Terminado'
  | 'Entregado';

export type Request = {
  id: string;
  title: string;
  category: 'Celular' | 'Computadora';
  device: string;
  description: string;
  status: Status;
  photos: number;
  photoUris?: string[];
  location: string;
  date: string;
  quote?: string;
  rating?: number;
  review?: string;
  quotePrice?: string;
  quoteTime?: string;
};

export type NotificationItem = {
  id: string;
  audience: 'cliente' | 'tecnico';
  title: string;
  body: string;
  requestId?: string;
  read: boolean;
};

export type ConnectionState = 'connected' | 'connecting' | 'offline';

export type FixGoState = {
  available: boolean;
  requests: Request[];
  notifications: NotificationItem[];
  connection: ConnectionState;
};

type SocketAction =
  | { type: 'REQUEST_CREATED'; request: Request }
  | {
      type: 'QUOTE_SUBMITTED';
      id: string;
      quote: string;
      quotePrice?: string;
      quoteTime?: string;
      technicianName?: string;
    }
  | { type: 'QUOTE_ACCEPTED'; id: string }
  | { type: 'QUOTE_REJECTED'; id: string }
  | { type: 'STATUS_UPDATED'; id: string; status: Status }
  | { type: 'RATING_SUBMITTED'; id: string; rating: number; review?: string }
  | { type: 'TECH_AVAILABILITY'; available: boolean }
  | { type: 'NOTIFICATION_READ'; id: string };

const INITIAL_REQUESTS: Request[] = [
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
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
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
];

let store: FixGoState = {
  available: true,
  requests: INITIAL_REQUESTS,
  notifications: INITIAL_NOTIFICATIONS,
  connection: 'connecting',
};

const listeners = new Set<() => void>();
let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let reconnectAttempts = 0;
let initialized = false;
let channel: BroadcastChannel | null = null;

function resolveWsUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_WS_URL;
  if (envUrl && envUrl.trim().length > 0) return envUrl.trim();

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    return `${protocol}//${host}:8085`;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as unknown as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } })
      .manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) return `ws://${host}:8085`;
  }

  if (Platform.OS === 'android') return 'ws://10.0.2.2:8085';
  return 'ws://localhost:8085';
}

function notify() {
  listeners.forEach((listener) => listener());
}

function applyLocalAction(action: SocketAction) {
  if (action.type === 'REQUEST_CREATED') {
    store = {
      ...store,
      requests: [
        action.request,
        ...store.requests.filter((r) => r.id !== action.request.id),
      ],
      notifications: [
        {
          id: `NT-${Date.now()}`,
          audience: 'tecnico',
          title: 'Nueva solicitud compatible',
          body: `${action.request.title} · ${action.request.location} · Ahora`,
          requestId: action.request.id,
          read: false,
        },
        ...store.notifications,
      ],
    };
    notify();
    return;
  }

  if (action.type === 'QUOTE_SUBMITTED') {
    const target = store.requests.find((r) => r.id === action.id);
    store = {
      ...store,
      requests: store.requests.map((r) =>
        r.id === action.id
          ? {
              ...r,
              quote: action.quote,
              quotePrice: action.quotePrice,
              quoteTime: action.quoteTime,
              status: 'Cotización recibida',
            }
          : r
      ),
      notifications: target
        ? [
            {
              id: `NT-${Date.now()}`,
              audience: 'cliente',
              title: 'Nueva cotización recibida',
              body: `${target.title} · ${action.technicianName || 'Carlos Méndez'} · Ahora`,
              requestId: target.id,
              read: false,
            },
            ...store.notifications,
          ]
        : store.notifications,
    };
    notify();
    return;
  }

  if (action.type === 'QUOTE_ACCEPTED') {
    const target = store.requests.find((r) => r.id === action.id);
    store = {
      ...store,
      requests: store.requests.map((r) =>
        r.id === action.id ? { ...r, status: 'Aceptado' } : r
      ),
      notifications: target
        ? [
            {
              id: `NT-${Date.now()}`,
              audience: 'tecnico',
              title: 'Propuesta aceptada',
              body: `${target.title} · Trabajo asignado · Ahora`,
              requestId: target.id,
              read: false,
            },
            ...store.notifications,
          ]
        : store.notifications,
    };
    notify();
    return;
  }

  if (action.type === 'QUOTE_REJECTED') {
    store = {
      ...store,
      requests: store.requests.map((r) =>
        r.id === action.id
          ? {
              ...r,
              quote: undefined,
              quotePrice: undefined,
              quoteTime: undefined,
              status: 'Publicado',
            }
          : r
      ),
    };
    notify();
    return;
  }

  if (action.type === 'STATUS_UPDATED') {
    const target = store.requests.find((r) => r.id === action.id);
    store = {
      ...store,
      requests: store.requests.map((r) =>
        r.id === action.id ? { ...r, status: action.status } : r
      ),
      notifications: target
        ? [
            {
              id: `NT-${Date.now()}`,
              audience: 'cliente',
              title: 'Servicio actualizado',
              body: `${target.title} · ${action.status} · Ahora`,
              requestId: target.id,
              read: false,
            },
            ...store.notifications,
          ]
        : store.notifications,
    };
    notify();
    return;
  }

  if (action.type === 'RATING_SUBMITTED') {
    store = {
      ...store,
      requests: store.requests.map((r) =>
        r.id === action.id
          ? { ...r, rating: action.rating, review: action.review }
          : r
      ),
    };
    notify();
    return;
  }

  if (action.type === 'TECH_AVAILABILITY') {
    store = { ...store, available: action.available };
    notify();
    return;
  }

  if (action.type === 'NOTIFICATION_READ') {
    store = {
      ...store,
      notifications: store.notifications.map((n) =>
        n.id === action.id ? { ...n, read: true } : n
      ),
    };
    notify();
  }
}

function setupBroadcastChannel() {
  if (Platform.OS !== 'web' || typeof BroadcastChannel === 'undefined' || channel) return;
  try {
    channel = new BroadcastChannel('fixgo-realtime-sync');
    channel.onmessage = (event) => {
      const data = event.data;
      if (data && data.type === 'SYNC_STATE' && data.state) {
        store = {
          ...store,
          available: data.state.available,
          requests: data.state.requests,
          notifications: data.state.notifications,
        };
        notify();
      }
    };
  } catch {}
}

function clearTimers() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

function scheduleReconnect() {
  clearTimers();
  const delay = Math.min(1500 * Math.pow(1.6, reconnectAttempts), 8000);
  reconnectAttempts += 1;
  reconnectTimer = setTimeout(() => {
    connectSocket();
  }, delay);
}

export function connectSocket() {
  setupBroadcastChannel();
  clearTimers();

  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  store = { ...store, connection: 'connecting' };
  notify();

  try {
    const ws = new WebSocket(resolveWsUrl());
    socket = ws;

    ws.onopen = () => {
      reconnectAttempts = 0;
      store = { ...store, connection: 'connected' };
      notify();
      heartbeatTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'PING' }));
        }
      }, 25000);
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(String(event.data));
        if (parsed.type === 'SYNC_STATE' && parsed.state) {
          store = {
            ...store,
            available: parsed.state.available,
            requests: parsed.state.requests,
            notifications: parsed.state.notifications,
          };
          notify();
        }
      } catch {}
    };

    ws.onerror = () => {
      store = { ...store, connection: 'offline' };
      notify();
    };

    ws.onclose = () => {
      socket = null;
      store = { ...store, connection: 'offline' };
      notify();
      scheduleReconnect();
    };
  } catch {
    store = { ...store, connection: 'offline' };
    notify();
    scheduleReconnect();
  }
}

export function dispatchSocketAction(action: SocketAction) {
  applyLocalAction(action);

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(action));
  }

  if (channel) {
    try {
      channel.postMessage({
        type: 'SYNC_STATE',
        state: {
          available: store.available,
          requests: store.requests,
          notifications: store.notifications,
        },
      });
    } catch {}
  }
}

export function useFixGoSync() {
  const [snapshot, setSnapshot] = useState<FixGoState>(store);

  useEffect(() => {
    if (!initialized) {
      initialized = true;
      connectSocket();
    }
    const listener = () => setSnapshot({ ...store });
    listeners.add(listener);
    listener();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    ...snapshot,
    reconnect: connectSocket,
    createRequest: (request: Request) =>
      dispatchSocketAction({ type: 'REQUEST_CREATED', request }),
    submitQuote: (
      id: string,
      quote: string,
      quotePrice?: string,
      quoteTime?: string,
      technicianName?: string
    ) =>
      dispatchSocketAction({
        type: 'QUOTE_SUBMITTED',
        id,
        quote,
        quotePrice,
        quoteTime,
        technicianName,
      }),
    acceptQuote: (id: string) => dispatchSocketAction({ type: 'QUOTE_ACCEPTED', id }),
    rejectQuote: (id: string) => dispatchSocketAction({ type: 'QUOTE_REJECTED', id }),
    updateStatus: (id: string, status: Status) =>
      dispatchSocketAction({ type: 'STATUS_UPDATED', id, status }),
    submitRating: (id: string, rating: number, review?: string) =>
      dispatchSocketAction({ type: 'RATING_SUBMITTED', id, rating, review }),
    setAvailable: (available: boolean) =>
      dispatchSocketAction({ type: 'TECH_AVAILABILITY', available }),
    markNotificationRead: (id: string) =>
      dispatchSocketAction({ type: 'NOTIFICATION_READ', id }),
  };
}