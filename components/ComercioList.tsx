import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Pressable,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchComercios, fetchCategorias, Comercio, Categoria } from '../lib/api';
import { colors, fonts, spacing, radius, shadow } from '../constants/theme';
import TarjetaComercio, { TarjetaEsqueleto } from './TarjetaComercio';
import SeccionCarrusel from './SeccionCarrusel';
import SeccionInfoEstatica, { ItemInfo } from './SeccionInfoEstatica';

// Kit de emergencia y logística local: contenido real (no viene de la API de
// comercios, es información fija de la ciudad), igual que en comerciantes.com.ar.
// Los que no tienen número real confirmado (agua, municipio) muestran una nota
// en vez de inventar un teléfono.
const KIT_EMERGENCIA: ItemInfo[] = [
  { icono: 'medkit', etiqueta: 'Hospital / Urgencias', numero: '107' },
  { icono: 'shield-checkmark', etiqueta: 'Policía / Seguridad', numero: '911' },
  { icono: 'flame', etiqueta: 'Bomberos Voluntarios', numero: '100' },
  { icono: 'flash', etiqueta: 'Guardia de Luz (CELW)', numero: '03462 461014' },
  { icono: 'warning', etiqueta: 'Emergencias Gas', numero: '0800 888 1137' },
  { icono: 'water', etiqueta: 'Agua Potable', nota: 'Reclamos Red' },
  { icono: 'business', etiqueta: 'Administración Municipal', nota: 'Atención al Vecino' },
  { icono: 'heart', etiqueta: 'Asistencia Género', numero: '144' },
];

const LOGISTICA_LOCAL: ItemInfo[] = [
  { icono: 'car', etiqueta: 'Remis Central', numero: '03462 15-123456' },
  { icono: 'car-sport', etiqueta: 'Remis El Rápido', numero: '03462 15-654321' },
  { icono: 'bus', etiqueta: 'A Rosario (Mar. y Jue.)', numero: '0341 15-123456' },
  { icono: 'bus', etiqueta: 'A Venado (Lun. a Vie.)', numero: '03462 15-789012' },
];

type Props = {
  soloAgro: boolean;
  colorAcento: string;
  textoVacio: string;
  // Home "Comerciantes" muestra secciones curadas (como comerciantes.com.ar) cuando
  // no hay búsqueda ni categoría activa. Agro se queda con la grilla simple.
  mostrarSeccionesCuradas?: boolean;
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

export default function ComercioList({ soloAgro, colorAcento, textoVacio, mostrarSeccionesCuradas }: Props) {
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

  const onSeleccionarCategoria = async (slug: string | null) => {
    const nueva = categoriaActiva === slug ? null : slug;
    setCategoriaActiva(nueva);
    await cargar(busqueda, nueva);
  };

  // Home: sin búsqueda ni categoría activa -> secciones curadas, iguales a las
  // de comerciantes.com.ar, con las mismas tarjetas estilo MercadoLibre.
  const modoInicio = mostrarSeccionesCuradas && !busqueda.trim() && !categoriaActiva;

  const secciones = useMemo(() => {
    if (!modoInicio) return null;
    const destacados = comercios
      .filter((c) => c.plan && c.plan !== 'gratuito')
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 10);
    const recientes = [...comercios].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 10);
    const porCategoria = (slug: string) => comercios.filter((c) => c.categoria_slug === slug);
    return {
      destacados,
      recientes,
      gastronomia: porCategoria('gastronomia'),
      indumentaria: porCategoria('indumentaria'),
      servicios: porCategoria('servicios'),
    };
  }, [modoInicio, comercios]);

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
          <TarjetaEsqueleto estiloContenedor={styles.tarjetaColumna} />
          <TarjetaEsqueleto estiloContenedor={styles.tarjetaColumna} />
        </View>
        <View style={styles.filaGrilla}>
          <TarjetaEsqueleto estiloContenedor={styles.tarjetaColumna} />
          <TarjetaEsqueleto estiloContenedor={styles.tarjetaColumna} />
        </View>
      </View>
    );
  }

  if (modoInicio && secciones) {
    return (
      <ScrollView
        style={styles.contenedor}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={[colorAcento]} />}
      >
        {encabezado}
        <SeccionCarrusel
          titulo="Los Favoritos de la Ciudad"
          subtitulo="Los comercios destacados de la guía"
          comercios={secciones.destacados}
          colorAcento={colorAcento}
        />
        <SeccionCarrusel
          titulo="¿Sale comidita?"
          subtitulo="Gastronomía en Colón"
          comercios={secciones.gastronomia}
          colorAcento={colorAcento}
          onVerTodos={() => onSeleccionarCategoria('gastronomia')}
        />
        <SeccionCarrusel
          titulo="Recién sumados a la guía"
          comercios={secciones.recientes}
          colorAcento={colorAcento}
        />
        <SeccionCarrusel
          titulo="Brillá más que nunca"
          subtitulo="Indumentaria y calzado"
          comercios={secciones.indumentaria}
          colorAcento={colorAcento}
          onVerTodos={() => onSeleccionarCategoria('indumentaria')}
        />
        <SeccionCarrusel
          titulo="Soluciones Mágicas"
          subtitulo="Servicios que te salvan las papas"
          comercios={secciones.servicios}
          colorAcento={colorAcento}
          onVerTodos={() => onSeleccionarCategoria('servicios')}
        />

        <Pressable
          style={({ pressed }) => [styles.bannerSumar, pressed && styles.presionado, { backgroundColor: colorAcento }]}
          onPress={() => router.push('/suscribirse')}
        >
          <Ionicons name="megaphone" size={22} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerSumarTitulo}>¿Tenés un comercio en Colón?</Text>
            <Text style={styles.bannerSumarTexto}>Sumate a la guía y recibí pedidos por WhatsApp.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </Pressable>

        <SeccionInfoEstatica
          titulo="Kit de Emergencia"
          subtitulo="Guardá esta sección, por las dudas"
          items={KIT_EMERGENCIA}
          colorAcento={colorAcento}
        />
        <SeccionInfoEstatica
          titulo="¡Te llevamos!"
          subtitulo="Remises, fletes y comisionistas"
          items={LOGISTICA_LOCAL}
          colorAcento={colorAcento}
        />

        {comercios.length === 0 ? <Text style={styles.vacio}>{textoVacio}</Text> : null}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
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
        renderItem={({ item }) => (
          <TarjetaComercio comercio={item} colorAcento={colorAcento} estiloContenedor={styles.tarjetaColumna} />
        )}
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
  tarjetaColumna: { flex: 1, marginBottom: spacing.md },
  bannerSumar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.md + 2,
    borderRadius: radius.md,
  },
  bannerSumarTitulo: { fontFamily: fonts.bold, fontSize: 13.5, color: '#fff' },
  bannerSumarTexto: { fontFamily: fonts.regular, fontSize: 11.5, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
});
