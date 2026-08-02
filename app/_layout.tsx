import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="comercio/[id]" options={{ title: 'Comercio', headerBackTitle: 'Atrás' }} />
        <Stack.Screen name="suscribirse" options={{ title: 'Sumá tu comercio', headerBackTitle: 'Atrás' }} />
      </Stack>
    </>
  );
}
