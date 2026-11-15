import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

const names: Record<string, string> = {
  cliente: 'Cliente',
  tecnico: 'Técnico',
  administrador: 'Administrador',
};

export default function DemoScreen() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const label = names[role ?? ''] ?? 'Usuario';

  return (
    <ScrollView className="flex-1 bg-[#02090a]" contentContainerClassName="min-h-full items-center justify-center px-6 py-12">
      <View className="w-full max-w-[520px] items-center rounded-xl border border-[#1e2c31] bg-[#041e18] px-7 py-10">
        <Image source={require('../../assets/fixgo-logo.png')} style={{ width: 80, height: 80 }} resizeMode="contain" />
        <Text className="mt-5 text-center text-3xl font-light tracking-wide text-white">Bienvenido a FixGo</Text>
        <Text className="mt-3 text-center text-base text-[#99b3ad]">Vista de demostración: {label}</Text>
        <Text className="mt-6 text-center text-sm leading-6 text-[#a1a1aa]">
          El acceso y el registro ya tienen su interfaz. Las pantallas de este rol y la conexión con el servidor se construirán después.
        </Text>
        <Pressable onPress={() => router.replace('/')} className="mt-8 min-h-12 w-full items-center justify-center rounded-full bg-white px-6">
          <Text className="font-semibold text-[#02090a]">Volver al inicio</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
