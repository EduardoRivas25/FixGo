import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

type Mode = 'welcome' | 'login' | 'register';
type Role = 'cliente' | 'tecnico' | 'administrador';
type Specialty = 'celulares' | 'computadoras';

const mint = '#36f4a4';

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View className="flex-row items-center">
      <Image source={require('../../assets/fixgo-logo.png')} style={{ width: compact ? 40 : 48, height: compact ? 40 : 48 }} resizeMode="contain" />
      <Text className="ml-1 text-[27px] font-semibold tracking-tight text-white">
        Fix<Text style={{ color: mint }}>Go</Text>
      </Text>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secure = false,
  autoComplete,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string;
  secure?: boolean;
  autoComplete?: 'email' | 'name' | 'password' | 'new-password';
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="mb-4">
      <Text className="mb-2 text-[13px] font-medium tracking-wide text-[#dbe5e0]">{label}</Text>
      <View className={`min-h-14 flex-row items-center rounded-xl border bg-[#072720] px-4 ${error ? 'border-[#e9938e]' : 'border-[#1e3b33]'}`}>
        <TextInput
          accessibilityLabel={label}
          autoCapitalize={autoComplete === 'email' ? 'none' : 'sentences'}
          autoComplete={autoComplete}
          keyboardType={autoComplete === 'email' ? 'email-address' : 'default'}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#78918a"
          secureTextEntry={secure && !visible}
          style={{ color: '#ffffff', flex: 1, fontSize: 15, paddingVertical: 14, outlineStyle: 'none' } as never}
          value={value}
        />
        {secure && (
          <Pressable accessibilityRole="button" onPress={() => setVisible(!visible)} hitSlop={8}>
            <Text className="text-xs font-medium text-[#9dabad]">{visible ? 'Ocultar' : 'Mostrar'}</Text>
          </Pressable>
        )}
      </View>
      {!!error && <Text className="mt-1.5 text-xs text-[#e9938e]">{error}</Text>}
    </View>
  );
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`min-h-11 flex-1 items-center justify-center rounded-full border px-4 ${selected ? 'border-[#36f4a4] bg-[#113d2e]' : 'border-[#1e3b33] bg-[#072720]'}`}
    >
      <Text className={`text-sm font-medium ${selected ? 'text-[#36f4a4]' : 'text-[#bdcbc5]'}`}>{label}</Text>
    </Pressable>
  );
}

export function AuthScreen({ mode }: { mode: Mode }) {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<Role>('cliente');
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleSpecialty = (item: Specialty) => {
    setSpecialties((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  };

  const submit = () => {
    const next: Record<string, string> = {};
    if (mode === 'register' && name.trim().length < 2) next.name = 'Escribe tu nombre.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Escribe un correo válido.';
    if (password.length < 8) next.password = 'Usa al menos 8 caracteres.';
    if (mode === 'register' && password !== confirm) next.confirm = 'Las contraseñas no coinciden.';
    if (mode === 'register' && role === 'tecnico' && specialties.length === 0) next.specialties = 'Elige al menos una especialidad.';
    setErrors(next);
    if (Object.keys(next).length === 0) {
      router.replace({ pathname: '/demo', params: { role } });
    }
  };

  const isWelcome = mode === 'welcome';
  const isRegister = mode === 'register';

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#02090a]" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="min-h-full flex-1" style={{ flexDirection: wide ? 'row' : 'column' }}>
          <View
            className="relative overflow-hidden bg-[#041e18]"
            style={{ width: wide ? '52%' : '100%', minHeight: wide ? 640 : isWelcome ? 350 : 205, paddingHorizontal: wide ? 64 : 26, paddingTop: wide ? 42 : 34, paddingBottom: wide ? 60 : 22 }}
          >
            <View className="absolute -right-36 top-10 h-[390px] w-[390px] rounded-full border border-[#164d3b]" />
            <View className="absolute -right-12 top-24 h-[270px] w-[270px] rounded-full border border-[#164d3b]" />
            <View className="absolute -bottom-32 -left-20 h-[330px] w-[330px] rounded-full bg-[#092b22]" />
            <Brand />
            <View className="flex-1 justify-end" style={{ maxWidth: 590, paddingTop: wide ? 90 : 28 }}>
              <View className="mb-5 h-1 w-12 rounded-full bg-[#36f4a4]" />
              <Text className="text-[11px] font-semibold uppercase tracking-[3px] text-[#36f4a4]">Servicio técnico, sin vueltas</Text>
              <Text className="mt-4 font-light leading-[1.05] tracking-tight text-white" style={{ fontSize: wide ? 58 : isWelcome ? 40 : 32 }}>
                Tu equipo en buenas manos.
              </Text>
              <Text className="mt-5 max-w-[450px] text-base leading-7 text-[#9dabad]" style={{ display: wide || isWelcome ? 'flex' : 'none' }}>
                Publica lo que necesitas, compara propuestas y encuentra a la persona indicada para repararlo.
              </Text>
              {wide && (
                <View className="mt-14 flex-row items-center gap-4">
                  <View className="h-10 w-10 items-center justify-center rounded-full border border-[#245742]"><Text className="text-[#36f4a4]">01</Text></View>
                  <Text className="text-sm text-[#9dabad]">Describe tu equipo · Recibe propuestas · Elige con confianza</Text>
                </View>
              )}
            </View>
          </View>

          <View className="flex-1 items-center justify-center bg-[#02090a] px-6 py-10" style={{ minHeight: wide ? 640 : undefined }}>
            <View className="w-full max-w-[450px]">
              <Text className="text-[11px] font-semibold uppercase tracking-[2.5px] text-[#36f4a4]">{isWelcome ? 'Bienvenido' : isRegister ? 'Únete a FixGo' : 'Qué gusto verte'}</Text>
              <Text className="mt-3 text-[34px] font-light leading-10 tracking-tight text-white">
                {isWelcome ? 'Todo empieza aquí.' : isRegister ? 'Crea tu cuenta.' : 'Inicia sesión.'}
              </Text>
              <Text className="mb-8 mt-3 text-[15px] leading-6 text-[#99b3ad]">
                {isWelcome ? 'Elige cómo quieres comenzar.' : isRegister ? 'Unos datos y estarás listo para empezar.' : 'Continúa donde dejaste tu servicio.'}
              </Text>

              {isWelcome ? (
                <>
                  <Pressable accessibilityRole="button" onPress={() => router.push('/login')} className="min-h-14 items-center justify-center rounded-full bg-white px-6">
                    <Text className="text-[15px] font-semibold text-[#02090a]">Iniciar sesión  →</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={() => router.push('/register')} className="mt-3 min-h-14 items-center justify-center rounded-full border border-[#60756d] px-6">
                    <Text className="text-[15px] font-semibold text-white">Crear cuenta</Text>
                  </Pressable>
                  <Text className="mt-9 text-center text-xs leading-5 text-[#78918a]">Reparaciones para celulares y computadoras, en un solo lugar.</Text>
                </>
              ) : (
                <>
                  {isRegister && <Field label="Nombre completo" value={name} onChangeText={setName} placeholder="Tu nombre" error={errors.name} autoComplete="name" />}
                  <Field label="Correo electrónico" value={email} onChangeText={setEmail} placeholder="tu@correo.com" error={errors.email} autoComplete="email" />
                  <Field label="Contraseña" value={password} onChangeText={setPassword} placeholder="Mínimo 8 caracteres" error={errors.password} secure autoComplete={isRegister ? 'new-password' : 'password'} />
                  {isRegister && <Field label="Confirmar contraseña" value={confirm} onChangeText={setConfirm} placeholder="Repite tu contraseña" error={errors.confirm} secure autoComplete="new-password" />}

                  <Text className="mb-3 mt-1 text-[13px] font-medium tracking-wide text-[#dbe5e0]">
                    {isRegister ? 'Quiero registrarme como' : 'Vista de demostración'}
                  </Text>
                  <View className="mb-4 flex-row gap-2">
                    <Choice label="Cliente" selected={role === 'cliente'} onPress={() => setRole('cliente')} />
                    <Choice label="Técnico" selected={role === 'tecnico'} onPress={() => setRole('tecnico')} />
                    {!isRegister && <Choice label="Admin" selected={role === 'administrador'} onPress={() => setRole('administrador')} />}
                  </View>
                  {isRegister && role === 'tecnico' && (
                    <View className="mb-4 rounded-xl border border-[#1e3b33] bg-[#041e18] p-4">
                      <Text className="mb-3 text-sm font-medium text-white">¿Qué equipos reparas?</Text>
                      <View className="flex-row gap-2">
                        <Choice label="Celulares" selected={specialties.includes('celulares')} onPress={() => toggleSpecialty('celulares')} />
                        <Choice label="Computadoras" selected={specialties.includes('computadoras')} onPress={() => toggleSpecialty('computadoras')} />
                      </View>
                      {!!errors.specialties && <Text className="mt-2 text-xs text-[#e9938e]">{errors.specialties}</Text>}
                      <Text className="mt-3 text-xs leading-5 text-[#8ba49a]">Podrás agregar la dirección de tu local en tu perfil.</Text>
                    </View>
                  )}

                  <Pressable accessibilityRole="button" onPress={submit} className="mt-3 min-h-14 items-center justify-center rounded-full bg-white px-6">
                    <Text className="text-[15px] font-semibold text-[#02090a]">{isRegister ? 'Crear cuenta' : 'Entrar'}  →</Text>
                  </Pressable>
                  <Text className="mt-3 text-center text-xs leading-5 text-[#78918a]">Prototipo visual · Los datos no se guardan todavía.</Text>
                  <View className="mt-7 flex-row justify-center">
                    <Text className="text-sm text-[#99b3ad]">{isRegister ? '¿Ya tienes cuenta? ' : '¿Aún no tienes cuenta? '}</Text>
                    <Pressable onPress={() => router.replace(isRegister ? '/login' : '/register')} accessibilityRole="link">
                      <Text className="text-sm font-semibold text-[#36f4a4]">{isRegister ? 'Inicia sesión' : 'Regístrate'}</Text>
                    </Pressable>
                  </View>
                  <Pressable onPress={() => router.replace('/')} className="mt-5 items-center py-2" accessibilityRole="link">
                    <Text className="text-xs text-[#78918a]">Volver al inicio</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
