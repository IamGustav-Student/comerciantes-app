import { Tabs, useRouter } from 'expo-router';
import { Text, Pressable, type ColorValue } from 'react-native';

function TabIcon({ emoji, color }: { emoji: string; color: ColorValue }) {
  return <Text style={{ fontSize: 20, color }}>{emoji}</Text>;
}

function BotonSumarComercio() {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push('/suscribirse')} hitSlop={10} style={{ marginRight: 16 }}>
      <Text style={{ fontSize: 22 }}>➕</Text>
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
          tabBarIcon: ({ color }) => <TabIcon emoji="🏪" color={color} />,
        }}
      />
      <Tabs.Screen
        name="agro"
        options={{
          title: 'Agro',
          headerTitle: 'AgroComercios',
          tabBarIcon: ({ color }) => <TabIcon emoji="🌾" color={color} />,
        }}
      />
    </Tabs>
  );
}
