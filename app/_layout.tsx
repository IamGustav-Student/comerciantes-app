import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { colors, fonts } from '../constants/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="comercio/[id]"
          options={{
            title: 'Comercio',
            headerBackTitle: 'Atrás',
            headerTitleStyle: { fontFamily: fonts.semiBold, color: colors.textStrong },
          }}
        />
        <Stack.Screen
          name="suscribirse"
          options={{
            title: 'Sumá tu comercio',
            headerBackTitle: 'Atrás',
            headerTitleStyle: { fontFamily: fonts.semiBold, color: colors.textStrong },
          }}
        />
      </Stack>
    </>
  );
}
