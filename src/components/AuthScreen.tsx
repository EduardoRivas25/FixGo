import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Mode = 'welcome' | 'login' | 'register';
type Role = 'cliente' | 'tecnico' | 'administrador';
type Specialty = 'celulares' | 'computadoras';

const F = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

const mint = '#201d48';

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View className="flex-row items-center">
      <Image
        source={require('../../assets/fixgo-logo.png')}
        style={{
          width: compact ? 40 : 48,
          height: compact ? 40 : 48,
          tintColor: '#201d48',
        }}
        resizeMode="contain"
      />
      <Text
        style={{ fontFamily: F.bold }}
        className="ml-1.5 text-[27px] tracking-tight text-[#141414]"
      >
        Fix<Text style={{ color: mint, fontFamily: F.bold }}>Go</Text>
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
  const [focused, setFocused] = useState(false);

  return (
    <View className="mb-4">
      <Text
        style={{ fontFamily: F.medium }}
        className="mb-2 text-[13px] tracking-wide text-[#141414]"
      >
        {label}
      </Text>
      <View
        className={`min-h-14 flex-row items-center rounded-none border bg-[#ffffff] px-4 ${
          error
            ? 'border-[#D0021B]'
            : focused
              ? 'border-[#141414]'
              : 'border-[#e0e0e0]'
        }`}
      >
        <TextInput
          accessibilityLabel={label}
          autoCapitalize={autoComplete === 'email' ? 'none' : 'sentences'}
          autoComplete={autoComplete}
          keyboardType={autoComplete === 'email' ? 'email-address' : 'default'}
          onBlur={() => setFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          placeholderTextColor="#757575"
          secureTextEntry={secure && !visible}
          style={[
            {
              color: '#141414',
              flex: 1,
              fontFamily: F.regular,
              fontSize: 15,
              paddingVertical: 14,
            },
            Platform.OS === 'web' ? ({ outlineStyle: 'none' } as never) : undefined,
          ]}
          value={value}
        />
        {secure && (
          <Pressable
            accessibilityRole="button"
            onPress={() => setVisible(!visible)}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
          >
            <Text style={{ fontFamily: F.medium }} className="text-xs text-[#2c2c2c]">
              {visible ? 'Ocultar' : 'Mostrar'}
            </Text>
          </Pressable>
        )}
      </View>
      {!!error && (
        <Text style={{ fontFamily: F.regular }} className="mt-1.5 text-xs text-[#D0021B]">
          {error}
        </Text>
      )}
    </View>
  );
}

function Choice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
      className={`min-h-11 flex-1 items-center justify-center rounded-full border px-4 ${
        selected ? 'border-[#005ad2] bg-[#ffd502]' : 'border-[#e0e0e0] bg-[#ffffff]'
      }`}
    >
      <Text
        style={{ fontFamily: selected ? F.semibold : F.medium }}
        className={`text-sm ${selected ? 'text-[#005ad2]' : 'text-[#757575]'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function AuthScreen({ mode }: { mode: Mode }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const wide = width >= 900;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<Role>('cliente');
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(12);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [mode, fadeAnim, slideAnim]);

  const fillDemo = (demoRole: 'cliente' | 'tecnico') => {
    setRole(demoRole);
    setEmail(demoRole === 'cliente' ? 'cliente@fixgo.mx' : 'tecnico@fixgo.mx');
    setPassword('FixGo2026');
    setErrors({});
  };

  const toggleSpecialty = (item: Specialty) => {
    setSpecialties((current) =>
      current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item]
    );
  };

  const submit = () => {
    const next: Record<string, string> = {};
    if (mode === 'register' && name.trim().length < 2) next.name = 'Escribe tu nombre.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = 'Escribe un correo válido.';
    if (password.length < 8) next.password = 'Usa al menos 8 caracteres.';
    if (mode === 'register' && password !== confirm)
      next.confirm = 'Las contraseñas no coinciden.';
    if (mode === 'register' && role === 'tecnico' && specialties.length === 0)
      next.specialties = 'Elige al menos una especialidad.';
    setErrors(next);
    if (Object.keys(next).length === 0) {
      router.replace({ pathname: '/demo', params: { role } });
    }
  };

  const isWelcome = mode === 'welcome';
  const isRegister = mode === 'register';

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#f6f6f6]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, minHeight: height }}
      >
        <View
          className="flex-1"
          style={{ flexDirection: wide ? 'row' : 'column', minHeight: height }}
        >
          <View
            className="relative overflow-hidden bg-[#ffd502]"
            style={{
              width: wide ? '52%' : '100%',
              minHeight: wide ? height : isWelcome ? 340 : 200,
              paddingHorizontal: wide ? 64 : 26,
              paddingTop: wide ? Math.max(42, insets.top + 20) : Math.max(34, insets.top + 18),
              paddingBottom: wide ? 60 : 24,
            }}
          >
            <View className="absolute -right-36 top-10 h-[390px] w-[390px] rounded-full border border-[#e96f14]" />
            <View className="absolute -right-12 top-24 h-[270px] w-[270px] rounded-full border border-[#e96f14]" />
            <View className="absolute -bottom-32 -left-20 h-[330px] w-[330px] rounded-full bg-[#f47d20]" />
            <Brand compact={!wide} />
            <View
              className="flex-1 justify-end"
              style={{ maxWidth: 590, paddingTop: wide ? 90 : 28 }}
            >
              <View className="mb-5 h-1 w-12 rounded-full bg-[#005ad2]" />
              <Text
                style={{ fontFamily: F.semibold }}
                className="text-[11px] uppercase tracking-[3px] text-[#005ad2]"
              >
                Servicio técnico, sin vueltas
              </Text>
              <Text
                style={{
                  fontFamily: F.bold,
                  fontSize: wide ? 37 : isWelcome ? 32 : 28,
                  lineHeight: wide ? 44 : isWelcome ? 39 : 34,
                }}
                className="mt-4 tracking-[-0.7px] text-[#141414]"
              >
                Tu equipo en buenas manos.
              </Text>
              {(wide || isWelcome) && (
                <Text
                  style={{ fontFamily: F.regular }}
                  className="mt-5 max-w-[450px] text-[15px] leading-7 text-[#2c2c2c]"
                >
                  Publica lo que necesitas, compara propuestas y encuentra a la persona indicada para repararlo.
                </Text>
              )}
              {wide && (
                <View className="mt-14 flex-row items-center gap-4">
                  <View className="h-10 w-10 items-center justify-center rounded-full border border-[#e96f14]">
                    <Text style={{ fontFamily: F.semibold }} className="text-xs text-[#005ad2]">
                      01
                    </Text>
                  </View>
                  <Text style={{ fontFamily: F.regular }} className="text-sm text-[#2c2c2c]">
                    Describe tu equipo · Recibe propuestas · Elige con confianza
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View
            className="flex-1 items-center justify-center bg-[#f6f6f6] px-6"
            style={{
              paddingTop: wide ? 48 : 34,
              paddingBottom: Math.max(40, insets.bottom + 24),
            }}
          >
            <Animated.View
              style={{
                width: '100%',
                maxWidth: 450,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <Text
                style={{ fontFamily: F.semibold }}
                className="text-[11px] uppercase tracking-[2.5px] text-[#005ad2]"
              >
                {isWelcome ? 'Bienvenido' : isRegister ? 'Únete a FixGo' : 'Qué gusto verte'}
              </Text>
              <Text
                style={{ fontFamily: F.bold }}
                className="mt-3 text-[32px] leading-[40px] tracking-[-0.6px] text-[#141414]"
              >
                {isWelcome ? 'Todo empieza aquí.' : isRegister ? 'Crea tu cuenta.' : 'Inicia sesión.'}
              </Text>
              <Text
                style={{ fontFamily: F.regular }}
                className="mb-8 mt-3 text-[15px] leading-6 text-[#2c2c2c]"
              >
                {isWelcome
                  ? 'Elige cómo quieres comenzar.'
                  : isRegister
                    ? 'Unos datos y estarás listo para empezar.'
                    : 'Continúa donde dejaste tu servicio.'}
              </Text>

              {isWelcome ? (
                <>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push('/login')}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.88 : 1,
                      transform: [{ scale: pressed ? 0.99 : 1 }],
                    })}
                    className="min-h-14 items-center justify-center rounded-full bg-[#f47d20] px-6"
                  >
                    <Text style={{ fontFamily: F.semibold }} className="text-[15px] text-[#141414]">
                      Iniciar sesión →
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push('/register')}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.8 : 1,
                      transform: [{ scale: pressed ? 0.99 : 1 }],
                    })}
                    className="mt-3 min-h-14 items-center justify-center rounded-full border border-[#141414] bg-transparent px-6"
                  >
                    <Text style={{ fontFamily: F.semibold }} className="text-[15px] text-[#141414]">
                      Crear cuenta
                    </Text>
                  </Pressable>
                  <Text
                    style={{ fontFamily: F.regular }}
                    className="mt-9 text-center text-xs leading-5 text-[#757575]"
                  >
                    Reparaciones para celulares y computadoras, en un solo lugar.
                  </Text>
                </>
              ) : (
                <>
                  {isRegister && (
                    <Field
                      label="Nombre completo"
                      value={name}
                      onChangeText={setName}
                      placeholder="Tu nombre"
                      error={errors.name}
                      autoComplete="name"
                    />
                  )}
                  <Field
                    label="Correo electrónico"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="tu@correo.com"
                    error={errors.email}
                    autoComplete="email"
                  />
                  <Field
                    label="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Mínimo 8 caracteres"
                    error={errors.password}
                    secure
                    autoComplete={isRegister ? 'new-password' : 'password'}
                  />
                  {isRegister && (
                    <Field
                      label="Confirmar contraseña"
                      value={confirm}
                      onChangeText={setConfirm}
                      placeholder="Repite tu contraseña"
                      error={errors.confirm}
                      secure
                      autoComplete="new-password"
                    />
                  )}

                  <Text
                    style={{ fontFamily: F.medium }}
                    className="mb-3 mt-1 text-[13px] tracking-wide text-[#141414]"
                  >
                    {isRegister ? 'Quiero registrarme como' : 'Vista de demostración'}
                  </Text>
                  <View className="mb-4 flex-row gap-2">
                    <Choice label="Cliente" selected={role === 'cliente'} onPress={() => setRole('cliente')} />
                    <Choice label="Técnico" selected={role === 'tecnico'} onPress={() => setRole('tecnico')} />
                    {!isRegister && (
                      <Choice
                        label="Admin"
                        selected={role === 'administrador'}
                        onPress={() => setRole('administrador')}
                      />
                    )}
                  </View>
                  {isRegister && role === 'tecnico' && (
                    <View className="mb-4 rounded-lg border border-[#e0e0e0] bg-[#ffffff] p-4">
                      <Text style={{ fontFamily: F.medium }} className="mb-3 text-sm text-[#141414]">
                        ¿Qué equipos reparas?
                      </Text>
                      <View className="flex-row gap-2">
                        <Choice
                          label="Celulares"
                          selected={specialties.includes('celulares')}
                          onPress={() => toggleSpecialty('celulares')}
                        />
                        <Choice
                          label="Computadoras"
                          selected={specialties.includes('computadoras')}
                          onPress={() => toggleSpecialty('computadoras')}
                        />
                      </View>
                      {!!errors.specialties && (
                        <Text style={{ fontFamily: F.regular }} className="mt-2 text-xs text-[#D0021B]">
                          {errors.specialties}
                        </Text>
                      )}
                      <Text style={{ fontFamily: F.regular }} className="mt-3 text-xs leading-5 text-[#757575]">
                        Podrás agregar la dirección de tu local en tu perfil.
                      </Text>
                    </View>
                  )}

                  <Pressable
                    accessibilityRole="button"
                    onPress={submit}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.88 : 1,
                      transform: [{ scale: pressed ? 0.99 : 1 }],
                    })}
                    className="mt-3 min-h-14 items-center justify-center rounded-full bg-[#f47d20] px-6"
                  >
                    <Text style={{ fontFamily: F.semibold }} className="text-[15px] text-[#141414]">
                      {isRegister ? 'Crear cuenta' : 'Entrar'} →
                    </Text>
                  </Pressable>
                  {!isRegister && (
                    <View className="mt-5 rounded-lg border border-[#e0e0e0] bg-[#ffffff] p-4">
                      <Text style={{ fontFamily: F.semibold }} className="mb-1 text-sm text-[#141414]">
                        Acceso de prueba
                      </Text>
                      <Text style={{ fontFamily: F.regular }} className="mb-3 text-xs leading-5 text-[#2c2c2c]">
                        Toca un perfil para rellenar sus credenciales. Contraseña: FixGo2026
                      </Text>
                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() => fillDemo('cliente')}
                          style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}
                          className="flex-1 rounded-full border border-[#e0e0e0] bg-[#f6f6f6] px-3 py-3"
                        >
                          <Text style={{ fontFamily: F.medium }} className="text-center text-sm text-[#141414]">
                            👤 Cliente
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => fillDemo('tecnico')}
                          style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}
                          className="flex-1 rounded-full border border-[#e0e0e0] bg-[#f6f6f6] px-3 py-3"
                        >
                          <Text style={{ fontFamily: F.medium }} className="text-center text-sm text-[#141414]">
                            🛠 Técnico
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                  <Text
                    style={{ fontFamily: F.regular }}
                    className="mt-3 text-center text-xs leading-5 text-[#757575]"
                  >
                    Sincronización en vivo disponible vía WebSockets.
                  </Text>
                  <View className="mt-7 flex-row justify-center">
                    <Text style={{ fontFamily: F.regular }} className="text-sm text-[#2c2c2c]">
                      {isRegister ? '¿Ya tienes cuenta? ' : '¿Aún no tienes cuenta? '}
                    </Text>
                    <Pressable
                      onPress={() => router.replace(isRegister ? '/login' : '/register')}
                      accessibilityRole="link"
                      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                    >
                      <Text style={{ fontFamily: F.semibold }} className="text-sm text-[#005ad2]">
                        {isRegister ? 'Inicia sesión' : 'Regístrate'}
                      </Text>
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={() => router.replace('/')}
                    className="mt-5 items-center py-2"
                    accessibilityRole="link"
                    style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
                  >
                    <Text style={{ fontFamily: F.medium }} className="text-xs text-[#757575]">
                      Volver al inicio
                    </Text>
                  </Pressable>
                </>
              )}
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}