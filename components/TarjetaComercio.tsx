import { Pressable, View, Text, Image, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Comercio } from '../lib/api';
import { colors, fonts, radius, shadow } from '../constants/theme';

type Props = {
  comercio: Comercio;
  colorAcento: string;
  estiloContenedor?: StyleProp<ViewStyle>;
};

export default function TarjetaComercio({ comercio, colorAcento, estiloContenedor }: Props) {
  const router = useRouter();
  const destacado = comercio.plan && comercio.plan !== 'gratuito';

  return (
    <Pressable
      style={({ pressed }) => [styles.tarjeta, estiloContenedor, pressed && styles.presionado]}
      onPress={() => router.push(`/comercio/${comercio.id}`)}
    >
      <View style={styles.fotoContenedor}>
        {comercio.foto_portada ? (
          <Image source={{ uri: comercio.foto_portada }} style={styles.foto} />
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
          {comercio.categoria_nombre || 'Sin categoría'}
        </Text>
        <Text style={styles.nombre} numberOfLines={2}>
          {comercio.nombre_negocio}
        </Text>
        {comercio.descripcion ? (
          <Text style={styles.descripcion} numberOfLines={2}>
            {comercio.descripcion}
          </Text>
        ) : null}
        {comercio.localidad_nombre ? (
          <View style={styles.ubicacionFila}>
            <Ionicons name="location-outline" size={11} color={colors.textFaint} />
            <Text style={styles.ubicacionTexto} numberOfLines={1}>
              {comercio.localidad_nombre}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export function TarjetaEsqueleto({ estiloContenedor }: { estiloContenedor?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.tarjeta, estiloContenedor]}>
      <View style={[styles.foto, styles.esqueletoBloque]} />
      <View style={styles.info}>
        <View style={[styles.esqueletoLinea, { width: '50%' }]} />
        <View style={[styles.esqueletoLinea, { width: '85%', marginTop: 8 }]} />
        <View style={[styles.esqueletoLinea, { width: '70%', marginTop: 8 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  presionado: { opacity: 0.75 },
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadow.card,
  },
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
