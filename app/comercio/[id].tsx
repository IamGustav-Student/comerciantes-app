import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Linking,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchComercio, ComercioDetalle } from '../../lib/api';
import { colors, fonts, spacing, radius, shadow } from '../../constants/theme';

export default function FichaComercioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [comercio, setComercio] = useState<ComercioDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCargando(true);
    fetchComercio(id)
      .then(setComercio)
      .catch(() => setError('No pudimos encontrar este comercio.'))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !comercio) {
    return (
      <View style={styles.centro}>
        <Text style={styles.error}>{error || 'Comercio no encontrado.'}</Text>
      </View>
    );
  }

  // Sticky CTA Bar (Llamar / WhatsApp / Cómo llegar) solo si el plan no es gratuito -
  // misma fricción a propósito que especifica el plan de negocio para la web.
  const esPago = !!comercio.plan_info && comercio.plan_info.plan_slug !== 'gratuito';
  const fotos = comercio.fotos.length > 0 ? comercio.fotos : null;
  const numeroWhatsapp = comercio.whatsapp ? comercio.whatsapp.replace(/\D/g, '') : null;

  return (
    <View style={styles.raiz}>
      <Stack.Screen options={{ title: comercio.nombre_negocio }} />

      <ScrollView contentContainerStyle={esPago ? styles.scrollConBarra : undefined}>
        {fotos ? (
          <FlatList
            data={fotos}
            horizontal
            keyExtractor={(f, i) => `${f.url}-${i}`}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <Image source={{ uri: item.url }} style={styles.fotoGaleria} />}
          />
        ) : (
          <View style={[styles.fotoGaleria, styles.fotoVacia]}>
            <Ionicons name="storefront-outline" size={40} color="#d7d7d7" />
          </View>
        )}

        <View style={styles.cuerpo}>
          <View style={styles.filaCategoria}>
            <Text style={styles.categoria}>{comercio.categoria_nombre || 'Comercio'}</Text>
            {esPago ? (
              <View style={styles.badgeDestacado}>
                <Ionicons name="star" size={11} color="#fff" />
                <Text style={styles.badgeDestacadoTexto}>Destacado</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.nombre}>{comercio.nombre_negocio}</Text>
          {comercio.localidad_nombre ? (
            <View style={styles.filaLocalidad}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={styles.localidad}>{comercio.localidad_nombre}</Text>
            </View>
          ) : null}

          {comercio.descripcion ? <Text style={styles.descripcion}>{comercio.descripcion}</Text> : null}

          {comercio.horarios ? (
            <View style={styles.bloque}>
              <Text style={styles.bloqueTitulo}>Horarios</Text>
              <Text style={styles.bloqueTexto}>{comercio.horarios}</Text>
            </View>
          ) : null}

          <View style={styles.bloque}>
            <Text style={styles.bloqueTitulo}>Ubicación</Text>
            <Text style={styles.bloqueTexto}>{comercio.direccion}</Text>
          </View>

          <View style={styles.redes}>
            {comercio.instagram ? (
              <Pressable
                style={({ pressed }) => [styles.redItem, pressed && styles.presionado]}
                onPress={() =>
                  Linking.openURL(`https://instagram.com/${comercio.instagram!.replace('@', '')}`)
                }
              >
                <Ionicons name="logo-instagram" size={16} color={colors.primary} />
                <Text style={styles.redLink}>Instagram</Text>
              </Pressable>
            ) : null}
            {comercio.facebook ? (
              <Pressable
                style={({ pressed }) => [styles.redItem, pressed && styles.presionado]}
                onPress={() => Linking.openURL(comercio.facebook!)}
              >
                <Ionicons name="logo-facebook" size={16} color={colors.primary} />
                <Text style={styles.redLink}>Facebook</Text>
              </Pressable>
            ) : null}
            {comercio.sitio_web ? (
              <Pressable
                style={({ pressed }) => [styles.redItem, pressed && styles.presionado]}
                onPress={() => Linking.openURL(comercio.sitio_web!)}
              >
                <Ionicons name="globe-outline" size={16} color={colors.primary} />
                <Text style={styles.redLink}>Sitio web</Text>
              </Pressable>
            ) : null}
          </View>

          {!esPago ? (
            <Text style={styles.avisoFreemium}>
              Este comercio todavía no tiene contacto directo habilitado.
            </Text>
          ) : null}
        </View>
      </ScrollView>

      {esPago ? (
        <View style={styles.barraSticky}>
          <Pressable
            style={({ pressed }) => [styles.botonBarra, pressed && styles.presionado]}
            onPress={() => Linking.openURL(`tel:${comercio.telefono}`)}
          >
            <Ionicons name="call" size={16} color={colors.textStrong} />
            <Text style={styles.botonBarraTexto}>Llamar</Text>
          </Pressable>

          {numeroWhatsapp ? (
            <Pressable
              style={({ pressed }) => [styles.botonBarra, styles.botonWhatsapp, pressed && styles.presionado]}
              onPress={() => Linking.openURL(`https://wa.me/${numeroWhatsapp}`)}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#fff" />
              <Text style={styles.botonBarraTextoBlanco}>WhatsApp</Text>
            </Pressable>
          ) : null}

          {comercio.latitud && comercio.longitud ? (
            <Pressable
              style={({ pressed }) => [styles.botonBarra, pressed && styles.presionado]}
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps/search/?api=1&query=${comercio.latitud},${comercio.longitud}`
                )
              }
            >
              <Ionicons name="navigate" size={16} color={colors.textStrong} />
              <Text style={styles.botonBarraTexto}>Cómo llegar</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: colors.surface },
  presionado: { opacity: 0.7 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  error: { color: colors.danger, fontFamily: fonts.medium, fontSize: 15, textAlign: 'center' },
  scrollConBarra: { paddingBottom: 90 },
  fotoGaleria: { width: 340, height: 220, backgroundColor: '#eee' },
  fotoVacia: { width: '100%', height: 220, alignItems: 'center', justifyContent: 'center' },
  cuerpo: { padding: spacing.xl },
  filaCategoria: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoria: { color: colors.primary, fontFamily: fonts.bold, fontSize: 12, textTransform: 'uppercase' },
  badgeDestacado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.md - 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeDestacadoTexto: { color: '#fff', fontSize: 10, fontFamily: fonts.bold },
  nombre: { fontSize: 22, fontFamily: fonts.bold, color: colors.textStrong, marginTop: 4 },
  filaLocalidad: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  localidad: { fontFamily: fonts.regular, color: colors.textMuted },
  descripcion: { marginTop: spacing.md + 2, fontSize: 15, fontFamily: fonts.regular, color: colors.textBody, lineHeight: 21 },
  bloque: { marginTop: spacing.xl - 2 },
  bloqueTitulo: { fontFamily: fonts.semiBold, color: colors.textStrong, marginBottom: 4 },
  bloqueTexto: { fontFamily: fonts.regular, color: colors.textMuted },
  redes: { flexDirection: 'row', gap: spacing.xl - 2, marginTop: spacing.xl },
  redItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  redLink: { color: colors.primary, fontFamily: fonts.semiBold },
  avisoFreemium: { marginTop: spacing.xl + 4, color: colors.textFaint, fontFamily: fonts.regular, fontSize: 13, fontStyle: 'italic' },
  barraSticky: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm + 2,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
  },
  botonBarra: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f4f4',
  },
  botonWhatsapp: { backgroundColor: colors.success },
  botonBarraTexto: { fontFamily: fonts.semiBold, color: colors.textStrong },
  botonBarraTextoBlanco: { fontFamily: fonts.semiBold, color: '#fff' },
});
