import { Tabs, useRouter } from 'expo-router';
import { Pressable, type ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function BotonSumarComercio() {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push('/suscribirse')} hitSlop={10} style={{ marginRight: 16 }}>
      <Ionicons name="add-circle" size={26} color="#e11d48" />
    </Pressable>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#e11d48',
        tabBarInactiveTintColor: '#9aa0a6',
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontWeight: '700', color: '#1e272e' },
        headerRight: () => <BotonSumarComercio />,
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
