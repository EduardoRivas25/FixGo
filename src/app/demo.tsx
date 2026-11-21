import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';

type Status = 'Publicado' | 'Cotización recibida' | 'Aceptado' | 'En diagnóstico' | 'En reparación' | 'Terminado' | 'Entregado';
type Request = {
  id: string; title: string; category: 'Celular' | 'Computadora'; device: string; description: string;
  status: Status; photos: number; photoUris?: string[]; location: string; date: string; quote?: string; rating?: number; quotePrice?: string; quoteTime?: string;
};

// Datos locales compartidos entre las dos vistas de demostración.
let requests: Request[] = [
  { id: 'FG-2048', title: 'Pantalla rota de iPhone 13', category: 'Celular', device: 'iPhone 13', description: 'Necesito cambiar la pantalla; se ve una línea verde y el cristal está quebrado. Busco una reparación con refacciones de buena calidad.', status: 'Cotización recibida', photos: 2, location: 'Colonia Del Valle, Benito Juárez', date: 'Hoy, 10:42', quote: 'Puedo cambiar el módulo completo con pieza OLED compatible. Incluye instalación y garantía de 90 días.', },
  { id: 'FG-2043', title: 'Laptop se apaga al iniciar', category: 'Computadora', device: 'Lenovo IdeaPad 5', description: 'Se apaga después de unos minutos. Necesito diagnóstico de batería y sistema de enfriamiento.', status: 'En reparación', photos: 1, location: 'Narvarte Poniente, Benito Juárez', date: 'Ayer, 16:20', quote: 'Diagnóstico y limpieza interna. Cambio de pasta térmica incluido.', },
  { id: 'FG-1982', title: 'Cambio de batería', category: 'Celular', device: 'Samsung Galaxy S22', description: 'La batería dura menos de dos horas y el equipo se calienta.', status: 'Entregado', photos: 2, location: 'Roma Sur, Cuauhtémoc', date: '12 nov', quote: 'Reemplazo de batería original con garantía de seis meses.', },
];

const T = { bg: '#f6f6f6', surface: '#ffffff', raised: '#f2f2f2', border: '#e0e0e0', moss: '#ffd502', white: '#141414', body: '#2c2c2c', helper: '#757575', mint: '#ffd502', orange: '#f47d20', navy: '#201d48', blue: '#005ad2' };
type Tab = 'Inicio' | 'Solicitudes' | 'Trabajos' | 'Notificaciones' | 'Perfil';
type Screen = 'tab' | 'create' | 'detail' | 'quote' | 'technician';
const repairSteps: Status[] = ['Aceptado', 'En diagnóstico', 'En reparación', 'Terminado', 'Entregado'];

function Action({ children, onPress, variant = 'primary', compact = false }: { children: string; onPress: () => void; variant?: 'primary' | 'outline' | 'soft'; compact?: boolean }) {
  const cls = variant === 'primary' ? 'bg-[#f47d20]' : variant === 'soft' ? 'border border-[#005ad2] bg-[#f2f2f2]' : 'border border-[#141414]';
  return <Pressable accessibilityRole="button" onPress={onPress} className={`${compact ? 'min-h-10 px-4' : 'min-h-12 px-5'} items-center justify-center rounded-full ${cls}`}><Text className={`font-ui text-sm font-bold tracking-wide ${variant === 'primary' ? 'text-[#141414]' : variant === 'soft' ? 'text-[#005ad2]' : 'text-[#141414]'}`}>{children}</Text></Pressable>;
}
function Panel({ children, className = '' }: { children: ReactNode; className?: string }) { return <View className={`mb-4 rounded-lg bg-white p-5 ${className}`}>{children}</View>; }
function Eyebrow({ children }: { children: ReactNode }) { return <Text className="font-ui mb-2 text-[11px] font-bold uppercase tracking-[1px] text-[#141414]">{children}</Text>; }
function Copy({ children }: { children: ReactNode }) { return <Text className="font-ui text-sm leading-6 text-[#2c2c2c]">{children}</Text>; }
function Heading({ children, size = 'text-[30px]' }: { children: ReactNode; size?: string }) { return <Text className={`font-display ${size} font-bold leading-tight tracking-[-0.6px] text-[#141414]`}>{children}</Text>; }
function StatusTag({ status }: { status: Status | string }) { return <View className="self-start bg-[#ffd502] px-3 py-1"><Text className="font-ui text-xs font-bold text-[#141414]">{status}</Text></View>; }
function Input({ label, value, onChangeText, placeholder, multiline = false }: { label: string; value: string; onChangeText: (v: string) => void; placeholder: string; multiline?: boolean }) {
  return <View className="mb-4"><Text className="mb-2 font-ui text-sm font-medium text-[#141414]">{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} multiline={multiline} placeholder={placeholder} placeholderTextColor="#757575" textAlignVertical={multiline ? 'top' : 'center'} className={`rounded-none border border-[#e0e0e0] bg-white px-4 py-3.5 font-ui text-[15px] leading-6 text-[#141414] ${multiline ? 'min-h-28' : 'min-h-12'}`} /></View>;
}
function PhotoTile({ index, uri, onPress, onRemove }: { index: number; uri?: string; onPress?: () => void; onRemove?: () => void }) {
  return <View className="mr-2 h-[88px] w-[88px] overflow-hidden rounded-lg bg-[#f2f2f2]">{uri ? <Image accessibilityLabel={`Fotografía ${index}`} source={{ uri }} resizeMode="cover" className="h-full w-full" /> : <Pressable accessibilityRole="button" onPress={onPress} className="h-full w-full items-center justify-center"><Text className="text-2xl">{index % 2 ? '📱' : '＋'}</Text><Text className="mt-1 text-[10px] tracking-wide text-[#757575]">{onPress ? 'AGREGAR' : `FOTO ${index}`}</Text></Pressable>}{onRemove && <Pressable accessibilityRole="button" accessibilityLabel={`Quitar fotografía ${index}`} onPress={onRemove} className="absolute right-1 top-1 bg-[#141414] px-1.5"><Text className="text-xs text-white">×</Text></Pressable>}</View>;
}
function MapPreview({ editable = false, onMove }: { editable?: boolean; onMove?: () => void }) {
  return <Pressable onPress={onMove} className="h-44 overflow-hidden rounded-lg bg-[#f2f2f2]">
    <View className="absolute inset-0 opacity-70"><View className="absolute left-8 top-0 h-56 w-px rotate-[28deg] bg-[#e0e0e0]"/><View className="absolute left-28 top-[-30px] h-60 w-px rotate-[-22deg] bg-[#e0e0e0]"/><View className="absolute left-0 top-16 h-px w-full rotate-[-8deg] bg-[#e0e0e0]"/><View className="absolute left-[-20px] top-28 h-px w-[120%] rotate-[9deg] bg-[#e0e0e0]"/><View className="absolute left-1/2 top-0 h-full w-px rotate-[50deg] bg-[#e0e0e0]"/></View>
    <View className="flex-1 items-center justify-center"><View className="h-10 w-10 items-center justify-center rounded-full bg-[#ffd502]"><Text className="text-lg">📍</Text></View><View className="mt-2 bg-[#141414] px-3 py-1"><Text className="text-xs text-white">Taller Méndez</Text></View>{editable && <Text className="mt-2 text-[10px] text-[#2c2c2c]">Toca para mover el marcador (demo)</Text>}</View>
  </Pressable>;
}

export default function DemoScreen() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const technician = role === 'tecnico';
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [tab, setTab] = useState<Tab>('Inicio');
  const [view, setView] = useState<Screen>('tab');
  const [revision, setRevision] = useState(0);
  const [selectedId, setSelectedId] = useState(requests[0]?.id ?? '');
  const [available, setAvailable] = useState(true);
  const [filter, setFilter] = useState('Activas');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [category, setCategory] = useState<'Celular' | 'Computadora'>('Celular');
  const [title, setTitle] = useState('');
  const [device, setDevice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const photos = photoUris.length;
  const [quoteText, setQuoteText] = useState('');
  const [price, setPrice] = useState('');
  const [time, setTime] = useState('');
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState('');
  const [notice, setNotice] = useState('');
  const [specialty, setSpecialty] = useState('Ambas');
  const [profileName, setProfileName] = useState('Carlos Méndez');
  const [shopName, setShopName] = useState('Taller Méndez');
  const [shopAddress, setShopAddress] = useState('Av. Insurgentes Sur 1234, Del Valle, CDMX');
  const [clientName, setClientName] = useState('Mariana López');
  const [clientEmail, setClientEmail] = useState('mariana.lopez@email.com');
  const [notificationRead, setNotificationRead] = useState(false);
  const refresh = () => setRevision((n) => n + 1);
  const current = requests.find((item) => item.id === selectedId) ?? requests[0];
  const nav: Tab[] = technician ? ['Inicio', 'Solicitudes', 'Trabajos', 'Notificaciones', 'Perfil'] : ['Inicio', 'Solicitudes', 'Notificaciones', 'Perfil'];
  const changeTab = (next: Tab) => { setTab(next); setView('tab'); };
  const selectRequest = (id: string, nextView: Screen = 'detail') => { setNotice(''); setSelectedId(id); setView(nextView); };
  const pickPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.8 });
    if (result.canceled) return;
    const selected = result.assets.map((asset) => asset.uri).filter(Boolean);
    setPhotoUris((currentUris) => [...currentUris, ...selected].slice(0, 5));
    setNotice('Fotos agregadas a la vista previa. No se envían a ningún servidor.');
  };

  const publishRequest = () => {
    if (!title.trim() || !device.trim() || !description.trim() || photos === 0 || !location.trim()) {
      setNotice('Completa los campos obligatorios y agrega al menos una foto.');
      return;
    }
    requests.unshift({ id: `FG-${Math.floor(2100 + Math.random() * 700)}`, title: title.trim(), category, device: device.trim(), description: description.trim(), status: 'Publicado', photos, photoUris, location: location.trim(), date: 'Ahora' });
    setNotice('');
    setTitle(''); setDevice(''); setDescription(''); setLocation(''); setPhotoUris([]); setView('tab'); setTab('Solicitudes'); refresh();
  };
  const submitQuote = () => {
    if (!quoteText.trim()) { setNotice('Escribe una propuesta antes de enviarla.'); return; }
    current.quote = quoteText.trim();
    current.quotePrice = price.trim();
    current.quoteTime = time.trim();
    current.status = 'Cotización recibida';
    setNotice('Cotización enviada. Queda pendiente de respuesta del cliente.');
    setQuoteText(''); setPrice(''); setTime(''); setView('detail'); refresh();
  };
  const acceptQuote = () => { current.status = 'Aceptado'; setNotice(`Trabajo asignado a ${profileName}.`); refresh(); };
  const rejectQuote = () => { current.quote = undefined; current.status = 'Publicado'; setNotice('Cotización rechazada en la demostración.'); refresh(); };
  const advanceWork = () => {
    const at = repairSteps.indexOf(current.status);
    if (at < 0 || at >= repairSteps.length - 1) return;
    current.status = repairSteps[at + 1]; refresh();
  };

  const photoGallery = (count: number, add?: () => void, canRemove = false, urls?: string[]) => <View className="flex-row flex-wrap">{Array.from({ length: count }, (_, index) => <PhotoTile key={index} index={index + 1} uri={urls?.[index]} onRemove={canRemove ? () => setPhotoUris((currentUris) => currentUris.filter((_, photoIndex) => photoIndex !== index)) : undefined} />)}{add && count < 5 && <PhotoTile index={count + 1} onPress={add} />}</View>;
  const statusHistory = () => <View className="mt-2">{repairSteps.map((step, index) => {
    const currentIndex = repairSteps.indexOf(current.status);
    const done = currentIndex >= index;
    return <View key={step} className="min-h-11 flex-row items-start"><View className="mr-3 items-center"><View className={`mt-1 h-3 w-3 rounded-full ${done ? 'bg-[#ffd502]' : 'border border-[#757575] bg-[#ffffff]'}`} />{index < repairSteps.length - 1 && <View className={`h-7 w-px ${done && currentIndex > index ? 'bg-[#ffd502]' : 'bg-[#e0e0e0]'}`} />}</View><Text className={`text-sm ${done ? 'text-[#141414]' : 'text-[#757575]'}`}>{step}{step === current.status ? ' · actual' : ''}</Text></View>;
  })}</View>;

  const segmented = (values: string[], selected: string, onSelect: (v: string) => void) => <View className="mb-4 flex-row flex-wrap gap-2">{values.map((value) => <Pressable key={value} onPress={() => onSelect(value)} className={`rounded-full border px-4 py-2.5 ${selected === value ? 'border-[#141414] bg-[#ffd502]' : 'border-[#e0e0e0] bg-[#ffffff]'}`}><Text className={`text-xs font-medium ${selected === value ? 'text-[#141414]' : 'text-[#757575]'}`}>{value}</Text></Pressable>)}</View>;

  const renderCreate = () => <>
    <Pressable onPress={() => setView('tab')} className="mb-5"><Text className="text-sm text-[#757575]">← Volver a mis solicitudes</Text></Pressable>
    <Eyebrow>Cuéntanos qué necesita</Eyebrow><Heading>Nueva solicitud</Heading><Copy>Describe el trabajo y agrega fotos para que los técnicos puedan preparar una propuesta.</Copy>
    <Panel className="mt-6">
      <Input label="Título *" value={title} onChangeText={setTitle} placeholder="Ej. Pantalla rota de iPhone" />
      <Text className="mb-2 text-sm font-medium text-[#141414]">Categoría *</Text>{segmented(['Celular', 'Computadora'], category, (v) => setCategory(v as 'Celular' | 'Computadora'))}
      <Input label="Tipo de equipo *" value={device} onChangeText={setDevice} placeholder="Marca y modelo (ej. iPhone 13)" />
      <Input label="¿Qué necesitas hacer o reparar? *" value={description} onChangeText={setDescription} placeholder="Describe el problema y el trabajo que buscas…" multiline />
      <Text className="mb-2 text-sm font-medium text-[#141414]">Fotos del equipo o la falla *</Text><Copy>Agrega hasta cinco fotos; puedes quitarlas antes de publicar. Se guardan en esta vista de demostración.</Copy>
      <View className="mt-3">{photoGallery(photos, pickPhotos, true, photoUris)}</View>
      <View className="mt-4"><Input label="Ubicación aproximada *" value={location} onChangeText={setLocation} placeholder="Colonia, alcaldía o zona" /></View>
      <MapPreview editable onMove={() => setLocation(location || 'Colonia Del Valle, Benito Juárez')} />
      {(title || device || description) && <View className="mt-4 rounded-lg border border-[#e0e0e0] bg-[#f2f2f2] p-4"><Eyebrow>Vista previa</Eyebrow><Text className="mb-1 text-base text-[#141414]">{title || 'Título de la solicitud'}</Text><Copy>{category} · {device || 'Tipo de equipo'}</Copy><View className="mt-2"><Copy>{description || 'La descripción aparecerá aquí.'}</Copy></View><Text className="mt-2 text-xs text-[#757575]">{photos} fotos · {location || 'Ubicación pendiente'}</Text></View>}
      {!!notice && <Text className="my-3 text-sm text-[#005ad2]">{notice}</Text>}
      <View className="mt-5"><Action onPress={publishRequest}>Revisar y publicar solicitud</Action></View>
    </Panel>
  </>;

  const renderCustomerDetail = () => <>
    <Pressable onPress={() => changeTab('Solicitudes')} className="mb-5"><Text className="text-sm text-[#757575]">← Mis solicitudes</Text></Pressable>
    <View className="mb-5 flex-row items-start justify-between"><View className="mr-3 flex-1"><Eyebrow>{current.id} · {current.date}</Eyebrow><Heading>{current.title}</Heading></View><StatusTag status={current.status} /></View>
    <Panel><Eyebrow>Detalle del equipo</Eyebrow><Text className="mb-2 text-base text-[#141414]">{current.category} · {current.device}</Text><Copy>{current.description}</Copy><View className="mt-5">{photoGallery(current.photos, undefined, false, current.photoUris)}</View><View className="mt-5"><Eyebrow>Ubicación aproximada</Eyebrow><Copy>📍 {current.location}</Copy></View></Panel>
    {current.quote && <Panel><View className="mb-3 flex-row items-center justify-between"><Eyebrow>Propuesta recibida</Eyebrow><Text className="text-xs text-[#757575]">Hoy · Carlos Méndez</Text></View><Text className="mb-3 text-lg text-[#141414]">Taller Méndez</Text><Copy>{current.quote}</Copy><Text className="mt-4 text-xs text-[#757575]">{current.quotePrice ? `Precio: ${current.quotePrice} MXN` : 'Precio no especificado'} · {current.quoteTime ? `Plazo: ${current.quoteTime}` : 'Plazo no especificado'}</Text><View className="mt-4 flex-row flex-wrap gap-2">{current.status === 'Cotización recibida' ? <><Action onPress={acceptQuote}>Aceptar propuesta</Action><Action variant="outline" onPress={rejectQuote}>Rechazar</Action></> : <StatusTag status="Propuesta aceptada" />}<Action variant="soft" onPress={() => setView('technician')}>Ver perfil y local</Action></View></Panel>}
    {current.status === 'Publicado' && <Panel><Eyebrow>En espera</Eyebrow><Copy>Tu solicitud está publicada. Las propuestas de técnicos aparecerán aquí para que puedas compararlas.</Copy></Panel>}
    {current.status !== 'Publicado' && <Panel><Eyebrow>Seguimiento del servicio</Eyebrow>{statusHistory()}</Panel>}
    {current.status === 'Entregado' && <Panel><Eyebrow>Tu experiencia</Eyebrow>{current.rating ? <><Heading size="text-xl">Gracias por compartir tu opinión.</Heading><Text className="mt-3 text-2xl text-[#141414]">{'★'.repeat(current.rating)}{'☆'.repeat(5 - current.rating)}</Text><Copy>{current.rating} de 5 estrellas · {review || 'Calificación enviada'}</Copy></> : <><Heading size="text-xl">¿Cómo estuvo el servicio?</Heading><Copy>Califica el trabajo de Carlos Méndez. Tu opinión ayuda a otros clientes.</Copy><View className="my-4 flex-row gap-2">{[1, 2, 3, 4, 5].map((n) => <Pressable accessibilityRole="button" accessibilityLabel={`${n} estrellas`} key={n} onPress={() => setStars(n)}><Text className="text-[38px]" style={{ color: n <= stars ? T.mint : '#e0e0e0' }}>★</Text></Pressable>)}</View>{stars > 0 && <Text className="mb-4 text-sm text-[#757575]">{stars} de 5 · {['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'][stars]}</Text>}<Input label="Comentario (opcional)" value={review} onChangeText={setReview} placeholder="Cuéntanos cómo fue…" multiline/><Action onPress={() => { current.rating = stars || 5; setNotice('Gracias por calificar el servicio.'); refresh(); }}>Enviar calificación</Action></>}</Panel>}
  </>;

  const renderTechnicianDetail = () => <>
    <Pressable onPress={() => changeTab('Solicitudes')} className="mb-5"><Text className="text-sm text-[#757575]">← Solicitudes disponibles</Text></Pressable>
    <Eyebrow>{current.id} · Solicitud disponible</Eyebrow><Heading>{current.title}</Heading><View className="my-4"><StatusTag status={current.status} /></View>
    <Panel><Eyebrow>Lo que necesita el cliente</Eyebrow><Text className="mb-2 text-base text-[#141414]">{current.category} · {current.device}</Text><Copy>{current.description}</Copy><View className="mt-5">{photoGallery(current.photos, undefined, false, current.photoUris)}</View><View className="mt-5"><Eyebrow>Zona aproximada</Eyebrow><Copy>📍 {current.location} · {current.date}</Copy></View></Panel>
    {current.status === 'Publicado' && <Panel><Eyebrow>Tu propuesta</Eyebrow><Copy>Enviar una cotización no asigna el trabajo. El cliente decidirá si acepta tu propuesta.</Copy><View className="mt-4"><Action onPress={() => { setQuoteText(''); setView('quote'); }}>Preparar cotización</Action></View></Panel>}
    {current.quote && <Panel><Eyebrow>Propuesta enviada</Eyebrow><Copy>{current.quote}</Copy><Text className="mt-3 text-xs text-[#757575]">{current.quotePrice ? `Precio: ${current.quotePrice} MXN` : 'Precio no especificado'} · {current.quoteTime ? `Tiempo: ${current.quoteTime}` : 'Tiempo no especificado'}</Text><Text className="mt-2 text-xs text-[#757575]">Pendiente de respuesta del cliente</Text></Panel>}
    {repairSteps.includes(current.status) ? <Panel><Eyebrow>Trabajo asignado</Eyebrow><Copy>El cliente aceptó tu propuesta. Actualiza el estado al avanzar.</Copy><View className="mt-4"><StatusTag status={current.status} /></View><View className="mt-4">{current.status !== 'Entregado' && <Action onPress={advanceWork}>{current.status === 'Terminado' ? 'Marcar como entregado' : 'Avanzar estado'}</Action>}</View><View className="mt-4">{statusHistory()}</View></Panel> : null}
  </>;

  const renderQuote = () => <>
    <Pressable onPress={() => setView('detail')} className="mb-5"><Text className="text-sm text-[#757575]">← Detalle de solicitud</Text></Pressable><Eyebrow>Propuesta para {current.id}</Eyebrow><Heading>Enviar cotización</Heading><Copy>Explica el trabajo previsto, tus condiciones y cualquier observación útil.</Copy>
    <Panel className="mt-5"><Text className="mb-1 text-base text-[#141414]">{current.title}</Text><Copy>{current.device} · {current.location}</Copy><View className="mt-5"><Input label="Propuesta escrita *" value={quoteText} onChangeText={setQuoteText} placeholder="Describe el diagnóstico o reparación, las piezas, garantía y condiciones…" multiline/><Input label="Precio (opcional)" value={price} onChangeText={setPrice} placeholder="$ MXN"/><Input label="Tiempo estimado (opcional)" value={time} onChangeText={setTime} placeholder="Ej. 2 horas"/></View>{!!notice && <Text className="mb-3 text-sm text-[#005ad2]">{notice}</Text>}<Action onPress={submitQuote}>Enviar propuesta al cliente</Action><Text className="mt-3 text-center text-xs leading-5 text-[#757575]">El trabajo solo se asigna si el cliente acepta.</Text></Panel>
  </>;

  const renderTechProfile = () => <>
    <Pressable onPress={() => setView('detail')} className="mb-5"><Text className="text-sm text-[#757575]">← Volver a la cotización</Text></Pressable><Eyebrow>Perfil del técnico</Eyebrow><Heading>Carlos Méndez</Heading>
    <Panel className="mt-5"><Text className="text-lg text-[#141414]">Técnico certificado · 4.9 ★</Text><Copy>Celulares · Computadoras · 126 servicios completados</Copy><View className="mt-5"><Eyebrow>Local y horarios</Eyebrow><Text className="mb-2 text-base text-[#141414]">Taller Méndez</Text><Copy>Av. Insurgentes Sur 1234, Del Valle, CDMX</Copy><Copy>Lun–Sáb · 9:00–18:00</Copy></View><View className="mt-4"><MapPreview /></View><Text className="mt-2 text-xs text-[#757575]">19.3869° N · 99.1740° O · Ubicación de ejemplo</Text></Panel>
  </>;

  const renderCustomer = () => {
    if (view === 'create') return renderCreate();
    if (view === 'detail') return renderCustomerDetail();
    if (view === 'technician') return renderTechProfile();
    if (tab === 'Notificaciones') return <><Eyebrow>Actualizaciones</Eyebrow><Heading>Notificaciones</Heading><Panel className="mt-5"><Pressable onPress={() => { setNotificationRead(true); selectRequest(requests[0].id); }}><Text className="mb-2 text-base text-[#141414]">Nueva cotización recibida</Text><Copy>Pantalla rota de iPhone 13 · Carlos Méndez · Hace 12 minutos</Copy><Text className="mt-3 text-xs text-[#005ad2]">{notificationRead ? 'Leída' : 'No leída'} · Abrir solicitud →</Text></Pressable></Panel><Panel><Text className="mb-2 text-base text-[#141414]">Servicio actualizado</Text><Copy>Laptop se apaga al iniciar · En reparación · Ayer</Copy><Text className="mt-3 text-xs text-[#757575]">Leída</Text></Panel></>;
    if (tab === 'Perfil') return <><Eyebrow>Tu cuenta</Eyebrow><Heading>Perfil de cliente</Heading><Panel className="mt-5"><Input label="Nombre completo" value={clientName} onChangeText={setClientName} placeholder="Tu nombre"/><Input label="Correo de contacto" value={clientEmail} onChangeText={setClientEmail} placeholder="tu@correo.com"/><Input label="Ubicación" value={location} onChangeText={setLocation} placeholder="Ciudad o colonia"/><View className="mt-2"><Action onPress={() => setNotice('Perfil actualizado en esta demostración.')}>Guardar cambios</Action></View>{!!notice && <Text className="mt-3 text-sm text-[#005ad2]">{notice}</Text>}<View className="mt-5"><Action variant="outline" onPress={() => router.replace('/')}>Cerrar sesión de demostración</Action></View></Panel></>;
    const list = requests.filter((item) => filter === 'Activas' ? item.status !== 'Entregado' : item.status === 'Entregado');
    return <>
      <View className="mb-5 flex-row items-end justify-between"><View><Eyebrow>{tab === 'Inicio' ? 'Tu espacio FixGo' : 'Actividad'}</Eyebrow><Heading>{tab === 'Inicio' ? `Hola, ${clientName.split(' ')[0]}` : 'Mis solicitudes'}</Heading></View><Text className="text-xs text-[#757575]">{requests.length} en total</Text></View>
      {tab === 'Inicio' && <Panel className="overflow-hidden"><View className="absolute -right-8 -top-10 h-36 w-36 rounded-full border border-[#e0e0e0]"/><Eyebrow>Reparar puede ser fácil</Eyebrow><Heading size="text-2xl">Encuentra a la persona indicada.</Heading><View className="mt-3"><Copy>Cuéntanos qué necesita tu equipo y compara propuestas de técnicos.</Copy></View><View className="mt-5 self-start"><Action onPress={() => { setNotice(''); setView('create'); }}>＋ Nueva solicitud</Action></View></Panel>}
      {tab === 'Solicitudes' && <View className="mb-4 self-start"><Action onPress={() => { setNotice(''); setView('create'); }}>＋ Nueva solicitud</Action></View>}
      {segmented(['Activas', 'Finalizadas'], filter, setFilter)}
      {list.length ? list.map((item) => <Pressable key={item.id} accessibilityRole="button" onPress={() => selectRequest(item.id)}><Panel><View className="mb-3 flex-row items-center justify-between"><Eyebrow>{item.id} · {item.date}</Eyebrow><StatusTag status={item.status}/></View><Text className="mb-1 text-lg text-[#141414]">{item.title}</Text><Copy>{item.category} · {item.device}</Copy><View className="mt-4 flex-row items-center justify-between"><Text className="text-xs text-[#757575]">▧ {item.photos} fotos · {item.location}</Text><Text className="text-sm text-[#005ad2]">Ver detalle →</Text></View></Panel></Pressable>) : <Panel><Heading size="text-xl">Aún no hay servicios aquí</Heading><View className="mt-2"><Copy>Cuando publiques una solicitud, podrás seguir su avance en esta sección.</Copy></View></Panel>}
    </>;
  };

  const renderTech = () => {
    if (view === 'detail') return renderTechnicianDetail();
    if (view === 'quote') return renderQuote();
    if (tab === 'Perfil') return <><Eyebrow>Tu cuenta de técnico</Eyebrow><Heading>Perfil y especialidades</Heading><Panel className="mt-5"><Input label="Nombre" value={profileName} onChangeText={setProfileName} placeholder="Tu nombre"/><Eyebrow>Especialidades</Eyebrow>{segmented(['Celulares', 'Computadoras', 'Ambas'], specialty, setSpecialty)}<View className="mb-4 flex-row items-center justify-between"><View><Eyebrow>Disponibilidad</Eyebrow><Copy>Recibir solicitudes compatibles</Copy></View><Pressable onPress={() => setAvailable(!available)} className="rounded-full border border-[#005ad2] px-4 py-2"><Text className="text-sm text-[#005ad2]">{available ? 'Disponible' : 'Pausado'}</Text></Pressable></View><Input label="Nombre del local" value={shopName} onChangeText={setShopName} placeholder="Nombre del taller"/><Input label="Dirección" value={shopAddress} onChangeText={setShopAddress} placeholder="Dirección del local"/><Eyebrow>Ubicación del marcador</Eyebrow><MapPreview editable onMove={() => setShopAddress('Nueva ubicación seleccionada · Del Valle, CDMX')}/><Text className="mt-2 text-xs text-[#757575]">Vista previa del perfil que verá el cliente.</Text><View className="mt-5"><Action onPress={() => setNotice('Perfil actualizado en esta demostración.')}>Guardar cambios</Action></View>{!!notice && <Text className="mt-3 text-sm text-[#005ad2]">{notice}</Text>}</Panel><Panel><Eyebrow>Vista del cliente</Eyebrow><Text className="text-base text-[#141414]">{shopName} · {profileName}</Text><Copy>{specialty} · {shopAddress}</Copy><View className="mt-4"><MapPreview/></View></Panel></>;
    if (tab === 'Notificaciones') return <><Eyebrow>Actualizaciones</Eyebrow><Heading>Notificaciones</Heading><Panel className="mt-5"><Pressable onPress={() => selectRequest(requests.find((r) => r.status === 'Publicado')?.id ?? requests[0].id)}><Text className="mb-2 text-base text-[#141414]">Nueva solicitud compatible</Text><Copy>Cambio de pantalla · Benito Juárez · Hace 12 minutos</Copy><Text className="mt-3 text-xs text-[#005ad2]">No leída · Ver solicitud →</Text></Pressable></Panel><Panel><Text className="mb-2 text-base text-[#141414]">Tu perfil está listo</Text><Copy>Completa tus especialidades y ubicación del local.</Copy><Text className="mt-3 text-xs text-[#757575]">Leída</Text></Panel></>;
    if (tab === 'Trabajos') {
      const jobs = requests.filter((r) => ['Aceptado', 'En diagnóstico', 'En reparación', 'Terminado', 'Entregado'].includes(r.status));
      const shown = jobs.filter((r) => filter === 'En curso' ? !['Terminado', 'Entregado'].includes(r.status) : ['Terminado', 'Entregado'].includes(r.status));
      return <><Eyebrow>Confirmados por el cliente</Eyebrow><Heading>Mis trabajos</Heading><View className="mt-5">{segmented(['En curso', 'Terminados'], filter, setFilter)}</View>{shown.length ? shown.map((item) => <Pressable key={item.id} onPress={() => selectRequest(item.id)}><Panel><Text className="mb-2 text-lg text-[#141414]">{item.title}</Text><Copy>{item.id} · {item.device}</Copy><View className="mt-3"><StatusTag status={item.status}/></View><Text className="mt-4 text-sm text-[#005ad2]">Abrir seguimiento →</Text></Panel></Pressable>) : <Panel><Heading size="text-xl">Todavía no hay trabajos</Heading><View className="mt-2"><Copy>Las propuestas pendientes no se consideran trabajos asignados.</Copy></View></Panel>}</>;
    }
    if (tab === 'Solicitudes') {
      const opportunities = available ? requests.filter((r) => r.status === 'Publicado' || r.status === 'Cotización recibida') : [];
      const compatible = opportunities.filter((r) => categoryFilter === 'Todas' || r.category === categoryFilter);
      return <><Eyebrow>Oportunidades compatibles</Eyebrow><Heading>Solicitudes disponibles</Heading><View className="mt-5">{segmented(['Todas', 'Celular', 'Computadora'], categoryFilter, setCategoryFilter)}</View>{compatible.length ? compatible.map((item) => <Pressable key={item.id} onPress={() => selectRequest(item.id)}><Panel><Text className="mb-2 text-lg text-[#141414]">{item.title}</Text><Copy>{item.category} · {item.device} · {item.date}</Copy><View className="my-3 flex-row items-center justify-between"><Text className="text-xs text-[#757575]">📍 {item.location}</Text><Text className="text-xs text-[#757575]">▧ {item.photos} fotos</Text></View><Copy>{item.description.length > 110 ? `${item.description.slice(0, 110)}…` : item.description}</Copy><Text className="mt-4 text-sm text-[#005ad2]">Revisar solicitud →</Text></Panel></Pressable>) : <Panel><Heading size="text-xl">No hay solicitudes disponibles</Heading><View className="mt-2"><Copy>Las nuevas solicitudes que coincidan con tus especialidades aparecerán aquí.</Copy></View></Panel>}</>;
    }
    return <><View className="mb-5"><Eyebrow>Tu espacio FixGo</Eyebrow><Heading>Hola, {profileName.split(' ')[0]}</Heading></View><Panel><View className="flex-row items-center justify-between"><View><Eyebrow>Disponibilidad</Eyebrow><Text className="text-lg text-[#141414]">{available ? 'Listo para recibir trabajos' : 'No estás recibiendo solicitudes'}</Text></View><Pressable onPress={() => setAvailable(!available)} className="rounded-full border border-[#005ad2] px-4 py-2"><Text className="text-sm text-[#005ad2]">{available ? 'Disponible' : 'Activar'}</Text></Pressable></View><View className="mt-3"><Copy>Especialidades · {specialty}</Copy></View></Panel><View className="mb-4 flex-row gap-3"><Panel className="mb-0 flex-1"><Text className="text-3xl font-medium text-[#141414]">{requests.filter((r) => r.status === 'Publicado').length}</Text><Text className="mt-1 text-xs text-[#757575]">Oportunidades</Text></Panel><Panel className="mb-0 flex-1"><Text className="text-3xl font-medium text-[#141414]">{requests.filter((r) => ['Aceptado', 'En diagnóstico', 'En reparación', 'Terminado'].includes(r.status)).length}</Text><Text className="mt-1 text-xs text-[#757575]">Trabajos activos</Text></Panel></View><View className="mb-4 flex-row items-center justify-between"><Eyebrow>Recién publicadas</Eyebrow><Pressable onPress={() => changeTab('Solicitudes')}><Text className="text-xs text-[#005ad2]">Ver todas →</Text></Pressable></View>{requests.filter((r) => available && r.status === 'Publicado').slice(0, 3).map((item) => <Pressable key={item.id} onPress={() => selectRequest(item.id)}><Panel><Text className="text-base text-[#141414]">{item.title}</Text><View className="mt-2"><Copy>{item.category} · {item.device} · {item.location}</Copy></View><Text className="mt-3 text-sm text-[#005ad2]">Enviar cotización →</Text></Panel></Pressable>)}{(!available || !requests.some((r) => r.status === 'Publicado')) && <Panel><Copy>{available ? 'Por ahora no hay solicitudes nuevas.' : 'Pausaste tu disponibilidad; no se muestran nuevas oportunidades.'}</Copy></Panel>}</>;
  };

  const pageTitle = view === 'create' ? 'Nueva solicitud' : view === 'quote' ? 'Enviar cotización' : view === 'detail' ? 'Detalle de solicitud' : view === 'technician' ? 'Perfil del técnico' : tab;
  return <View accessibilityLabel={`demo-revision-${revision}`} className="flex-1 bg-[#f6f6f6]" style={{ flexDirection: wide ? 'row' : 'column' }}>
    <View className="flex-1" style={{ maxWidth: wide ? 1120 : undefined, alignSelf: 'center', width: '100%' }}>
      <View className="flex-row items-center justify-between bg-[#ffd502] px-5 py-4"><View className="flex-row items-center"><View className="mr-2 h-8 w-8 items-center justify-center bg-[#201d48]"><Text className="text-base text-[#ffd502]">✳</Text></View><Text className="text-[23px] font-bold tracking-[-0.4px] text-[#141414]">FixGo</Text></View><View className="flex-row items-center gap-3"><View className="bg-[#141414] px-3 py-1.5"><Text className="text-[10px] font-semibold tracking-[1px] text-white">DEMO · {technician ? 'TÉCNICO' : 'CLIENTE'}</Text></View><Pressable accessibilityRole="button" onPress={() => router.replace('/login')}><Text className="text-xs font-semibold text-[#141414] underline">Cambiar rol</Text></Pressable></View></View>
      <View className="flex-1" style={{ flexDirection: wide ? 'row' : 'column' }}>
        {wide && <View className="w-56 border-r border-[#e0e0e0] bg-[#ffffff] p-4">{nav.map((item) => <Pressable key={item} onPress={() => changeTab(item)} className={`mb-2 border-b-[3px] px-4 py-3.5 ${tab === item && view === 'tab' ? 'border-[#141414]' : 'border-transparent'}`}><Text className={`text-sm ${tab === item && view === 'tab' ? 'text-[#141414]' : 'text-[#757575]'}`}>{item}</Text></Pressable>)}</View>}
        <ScrollView className="flex-1" contentContainerStyle={{ width: '100%', maxWidth: 760, alignSelf: 'center', padding: wide ? 36 : 20, paddingBottom: 118 }}>
          {view === 'tab' ? (technician ? renderTech() : renderCustomer()) : view === 'create' ? renderCreate() : view === 'quote' ? renderQuote() : view === 'technician' ? renderTechProfile() : technician ? renderTechnicianDetail() : renderCustomerDetail()}
        </ScrollView>
      </View>
      {!wide && <View className="absolute bottom-0 left-0 right-0 flex-row justify-around border-t border-[#e0e0e0] bg-[#ffffff] px-1 pb-3 pt-2">{nav.map((item) => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: tab === item && view === 'tab' }} onPress={() => changeTab(item)} className={`min-w-[58px] flex-1 items-center border-b-[3px] px-1 py-2 ${tab === item && view === 'tab' ? 'border-[#141414]' : 'border-transparent'}`}><Text className={`text-lg ${tab === item && view === 'tab' ? 'text-[#141414]' : 'text-[#757575]'}`}>{({ Inicio: '⌂', Solicitudes: '▤', Trabajos: '✓', Notificaciones: '◉', Perfil: '○' } as Record<Tab, string>)[item]}</Text><Text className={`mt-1 text-[9px] tracking-wide ${tab === item && view === 'tab' ? 'text-[#141414]' : 'text-[#757575]'}`}>{item}</Text></Pressable>)}</View>}
      {!!notice && view !== 'tab' && view !== 'create' && <Pressable onPress={() => setNotice('')} className="absolute bottom-20 left-5 right-5 rounded-lg border border-[#e0e0e0] bg-[#f2f2f2] p-4"><Text className="text-sm text-[#141414]">{notice}</Text></Pressable>}
    </View>
    {!wide && <Text accessibilityLabel={pageTitle} className="hidden">{pageTitle}</Text>}
  </View>;
}
