import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Image,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchComercios, fetchCategorias, Comercio, Categoria } from '../lib/api';

type Props = {
  soloAgro: boolean;
  colorAcento: string;
  textoVacio: string;
};

export default function ComercioList({ soloAgro, colorAcento, textoVacio }: Props) {
  const router = useRouter();
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cargar = useCallback(
    async (q?: string, categoria?: string | null) => {
      try {
        setError(null);
        const data = await fetchComercios({
          agro: soloAgro,
          q: q || undefined,
          categoria: categoria || undefined,
        });
        setComercios(data);
      } catch {
        setError('No pudimos cargar los comercios. Revisá tu conexión.');
      }
    },
    [soloAgro]
  );

  useEffect(() => {
    setCargando(true);
    Promise.all([cargar(), fetchCategorias().then(setCategorias).catch(() => {})]).finally(() =>
      setCargando(false)
    );
  }, [cargar]);

  const onRefresh = async () => {
    setRefrescando(true);
    await cargar(busqueda, categoriaActiva);
    setRefrescando(false);
  };

  const onBuscar = (texto: string) => {
    setBusqueda(texto);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => cargar(texto, categoriaActiva), 350);
  };

  const onSeleccionarCategoria = async (slug: string) => {
    const nueva = categoriaActiva === slug ? null : slug;
    setCategoriaActiva(nueva);
    await cargar(busqueda, nueva);
  };

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={colorAcento} />
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <TextInput
        style={styles.buscador}
        placeholder="Buscar comercio..."
        value={busqueda}
        onChangeText={onBuscar}
      />
      {categorias.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {categorias.map((cat) => {
            const activa = categoriaActiva === cat.slug;
            return (
              <Pressable
                key={cat.slug}
                style={[
                  styles.chip,
                  activa && { backgroundColor: colorAcento, borderColor: colorAcento },
                ]}
                onPress={() => onSeleccionarCategoria(cat.slug)}
              >
                <Text style={[styles.chipTexto, activa && styles.chipTextoActivo]}>
                  {cat.nombre}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={comercios}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={comercios.length === 0 ? styles.listaVacia : undefined}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={[colorAcento]} />
        }
        ListEmptyComponent={<Text style={styles.vacio}>{textoVacio}</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.tarjeta} onPress={() => router.push(`/comercio/${item.id}`)}>
            {item.foto_portada ? (
              <Image source={{ uri: item.foto_portada }} style={styles.foto} />
            ) : (
              <View style={[styles.foto, styles.fotoVacia]} />
            )}
            <View style={styles.info}>
              <Text style={styles.nombre}>{item.nombre_negocio}</Text>
              <Text style={[styles.categoria, { color: colorAcento }]}>
                {item.categoria_nombre || 'Sin categoría'}
              </Text>
              {item.descripcion ? (
                <Text style={styles.descripcion} numberOfLines={2}>
                  {item.descripcion}
                </Text>
              ) : null}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#f4f7f6' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  buscador: {
    margin: 14,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  chips: { paddingHorizontal: 14, paddingBottom: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  chipTexto: { fontSize: 13, fontWeight: '600', color: '#4a4a4a' },
  chipTextoActivo: { color: '#fff' },
  error: { color: '#e11d48', textAlign: 'center', marginBottom: 8 },
  listaVacia: { flexGrow: 1 },
  vacio: { textAlign: 'center', color: '#888', marginTop: 40, paddingHorizontal: 24 },
  tarjeta: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 14,
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  foto: { width: 84, height: 84 },
  fotoVacia: { backgroundColor: '#eee' },
  info: { flex: 1, padding: 12, justifyContent: 'center' },
  nombre: { fontWeight: '700', fontSize: 15, color: '#1e272e' },
  categoria: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  descripcion: { fontSize: 13, color: '#636e72', marginTop: 4 },
});
