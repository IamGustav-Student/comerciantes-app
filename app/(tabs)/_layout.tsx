import { Tabs, useRouter } from 'expo-router';
import { Pressable, View, Alert, type ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../../constants/theme';

function BotonAvatar() {
  return (
    <Pressable
      onPress={() =>
        Alert.alert('Tu perfil', 'La cuenta de usuario todavía no está disponible en esta versión.')
      }
      hitSlop={10}
      style={{ marginLeft: 16 }}
    >
      <Ionicons name="person-circle" size={30} color={colors.textFaint} />
    </Pressable>
  );
}

function BotonNotificaciones() {
  return (
    <Pressable
      onPress={() =>
        Alert.alert(
          'Notificaciones',
          'Muy pronto vas a poder activar avisos de nuevos comercios y promociones.'
        )
      }
      hitSlop={10}
    >
      <Ionicons name="notifications-outline" size={24} color={colors.textStrong} />
    </Pressable>
  );
}

function BotonSumarComercio() {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push('/suscribirse')} hitSlop={10}>
      <Ionicons name="add-circle" size={26} color={colors.primary} />
    </Pressable>
  );
}

function AccionesHeader() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginRight: 16 }}>
      <BotonNotificaciones />
      <BotonSumarComercio />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontFamily: fonts.bold, fontSize: 19, color: colors.textStrong },
        headerLeft: () => <BotonAvatar />,
        headerRight: () => <AccionesHeader />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Comerciantes',
          headerTitle: 'Comerciantes.com.ar',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'storefront' : 'storefront-outline'} size={22} color={color as ColorValue} />
          ),
        }}
      />
      <Tabs.Screen
        name="agro"
        options={{
          title: 'Agro',
          headerTitle: 'AgroComercios',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'leaf' : 'leaf-outline'} size={22} color={color as ColorValue} />
          ),
        }}
      />
    </Tabs>
  );
}
