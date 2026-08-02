import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchComercios, fetchCategorias, Comercio, Categoria } from '../lib/api';
import { colors, fonts, spacing, radius, shadow } from '../constants/theme';

type Props = {
  soloAgro: boolean;
  colorAcento: string;
  textoVacio: string;
};

const EMOJI_CATEGORIA: Record<string, string> = {
  gastronomia: '🍽️',
  comerciantes: '🛍️',
  artesanias: '🎨',
  servicios: '🔧',
  indumentaria: '👕',
  agro: '🌾',
  otros: '📦',
};

function TarjetaEsqueleto() {
  return (
    <View style={[styles.tarjeta, styles.tarjetaColumna]}>
      <View style={[styles.foto, styles.esqueletoBloque]} />
      <View style={styles.info}>
        <View style={[styles.esqueletoLinea, { width: '50%' }]} />
        <View style={[styles.esqueletoLinea, { width: '85%', marginTop: 8 }]} />
        <View style={[styles.esqueletoLinea, { width: '70%', marginTop: 8 }]} />
      </View>
    </View>
  );
}

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

  const encabezado = (
    <>
      <View style={styles.buscadorCaja}>
        <Ionicons name="search" size={18} color={colors.textFaint} />
        <TextInput
          style={styles.buscadorInput}
          placeholder="Buscar comercio..."
          placeholderTextColor={colors.textFaint}
          value={busqueda}
          onChangeText={onBuscar}
        />
        {busqueda.length > 0 ? (
          <Pressable onPress={() => onBuscar('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color="#c7c7c7" />
          </Pressable>
        ) : null}
      </View>

      {categorias.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categorias}
        >
          {categorias.map((cat) => {
            const activa = categoriaActiva === cat.slug;
            return (
              <Pressable
                key={cat.slug}
                style={({ pressed }) => [styles.categoriaItem, pressed && styles.presionado]}
                onPress={() => onSeleccionarCategoria(cat.slug)}
              >
                <View
                  style={[
                    styles.categoriaCirculo,
                    activa && { backgroundColor: colorAcento, borderColor: colorAcento },
                  ]}
                >
                  <Text style={styles.categoriaEmoji}>{EMOJI_CATEGORIA[cat.slug] || '🏷️'}</Text>
                </View>
                <Text
                  style={[styles.categoriaTexto, activa && { color: colorAcento, fontFamily: fonts.semiBold }]}
                  numberOfLines={1}
                >
                  {cat.nombre}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </>
  );

  if (cargando) {
    return (
      <View style={styles.contenedor}>
        {encabezado}
        <View style={styles.filaGrilla}>
          <TarjetaEsqueleto />
          <TarjetaEsqueleto />
        </View>
        <View style={styles.filaGrilla}>
          <TarjetaEsqueleto />
          <TarjetaEsqueleto />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <FlatList
        data={comercios}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.filaGrilla}
        ListHeaderComponent={encabezado}
        contentContainerStyle={comercios.length === 0 ? styles.listaVacia : styles.contenidoGrilla}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={[colorAcento]} />
        }
        ListEmptyComponent={<Text style={styles.vacio}>{textoVacio}</Text>}
        renderItem={({ item }) => {
          const destacado = item.plan && item.plan !== 'gratuito';
          return (
            <Pressable
              style={({ pressed }) => [styles.tarjeta, styles.tarjetaColumna, pressed && styles.presionado]}
              onPress={() => router.push(`/comercio/${item.id}`)}
            >
              <View style={styles.fotoContenedor}>
                {item.foto_portada ? (
                  <Image source={{ uri: item.foto_portada }} style={styles.foto} />
                ) : (
                  <View style={[styles.foto, styles.fotoVacia]}>
                    <Ionicons name="storefront-outline" size={26} color="#c7c7c7" />
                  </View>
                )}
                {destacado ? (
                  <View style={[styles.cintaDestacado, { backgroundColor: colorAcento }]}>
                    <Text style={styles.cintaTexto}>Destacado</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.info}>
                <Text style={[styles.categoria, { color: colorAcento }]} numberOfLines={1}>
                  {item.categoria_nombre || 'Sin categoría'}
                </Text>
                <Text style={styles.nombre} numberOfLines={2}>
                  {item.nombre_negocio}
                </Text>
                {item.descripcion ? (
                  <Text style={styles.descripcion} numberOfLines={2}>
                    {item.descripcion}
                  </Text>
                ) : null}
                {item.localidad_nombre ? (
                  <View style={styles.ubicacionFila}>
                    <Ionicons name="location-outline" size={11} color={colors.textFaint} />
                    <Text style={styles.ubicacionTexto} numberOfLines={1}>
                      {item.localidad_nombre}
                    </Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.background },
  presionado: { opacity: 0.75 },
  buscadorCaja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 11,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    ...shadow.suave,
  },
  buscadorInput: { flex: 1, fontSize: 15, fontFamily: fonts.regular, color: colors.textStrong, padding: 0 },
  categorias: { paddingHorizontal: 10, paddingBottom: spacing.md + 2, gap: 4 },
  categoriaItem: { alignItems: 'center', width: 68, marginHorizontal: 4 },
  categoriaCirculo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoriaEmoji: { fontSize: 22 },
  categoriaTexto: { fontSize: 11, fontFamily: fonts.medium, color: '#4a4a4a', textAlign: 'center' },
  error: { color: colors.danger, fontFamily: fonts.medium, textAlign: 'center', marginBottom: spacing.sm },
  listaVacia: { flexGrow: 1 },
  vacio: { fontFamily: fonts.regular, textAlign: 'center', color: colors.textFaint, marginTop: 40, paddingHorizontal: 24 },
  contenidoGrilla: { paddingHorizontal: 10, paddingBottom: 20 },
  filaGrilla: { gap: 10, paddingHorizontal: 4 },
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadow.card,
  },
  tarjetaColumna: { flex: 1, marginBottom: spacing.md },
  fotoContenedor: { position: 'relative' },
  foto: { width: '100%', height: 110 },
  fotoVacia: { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  cintaDestacado: {
    position: 'absolute',
    top: 8,
    left: -28,
    width: 110,
    paddingVertical: 2,
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
  },
  cintaTexto: { color: '#fff', fontFamily: fonts.bold, fontSize: 9, letterSpacing: 0.3 },
  info: { padding: 10 },
  nombre: { fontFamily: fonts.semiBold, fontSize: 13.5, color: colors.textStrong, marginTop: 2, lineHeight: 17 },
  categoria: { fontFamily: fonts.bold, fontSize: 10.5, textTransform: 'uppercase' },
  descripcion: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 4, lineHeight: 15 },
  ubicacionFila: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 },
  ubicacionTexto: { fontFamily: fonts.regular, fontSize: 10.5, color: colors.textFaint },
  esqueletoBloque: { backgroundColor: colors.skeleton },
  esqueletoLinea: { height: 9, borderRadius: 5, backgroundColor: colors.skeleton },
});
