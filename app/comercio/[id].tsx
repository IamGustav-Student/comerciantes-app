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
        <ActivityIndicator size="large" color="#e11d48" />
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
          <View style={[styles.fotoGaleria, styles.fotoVacia]} />
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
              <Ionicons name="location-outline" size={14} color="#636e72" />
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
                style={styles.redItem}
                onPress={() =>
                  Linking.openURL(`https://instagram.com/${comercio.instagram!.replace('@', '')}`)
                }
              >
                <Ionicons name="logo-instagram" size={16} color="#e11d48" />
                <Text style={styles.redLink}>Instagram</Text>
              </Pressable>
            ) : null}
            {comercio.facebook ? (
              <Pressable style={styles.redItem} onPress={() => Linking.openURL(comercio.facebook!)}>
                <Ionicons name="logo-facebook" size={16} color="#e11d48" />
                <Text style={styles.redLink}>Facebook</Text>
              </Pressable>
            ) : null}
            {comercio.sitio_web ? (
              <Pressable style={styles.redItem} onPress={() => Linking.openURL(comercio.sitio_web!)}>
                <Ionicons name="globe-outline" size={16} color="#e11d48" />
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
          <Pressable style={styles.botonBarra} onPress={() => Linking.openURL(`tel:${comercio.telefono}`)}>
            <Ionicons name="call" size={16} color="#1e272e" />
            <Text style={styles.botonBarraTexto}>Llamar</Text>
          </Pressable>

          {numeroWhatsapp ? (
            <Pressable
              style={[styles.botonBarra, styles.botonWhatsapp]}
              onPress={() => Linking.openURL(`https://wa.me/${numeroWhatsapp}`)}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#fff" />
              <Text style={styles.botonBarraTextoBlanco}>WhatsApp</Text>
            </Pressable>
          ) : null}

          {comercio.latitud && comercio.longitud ? (
            <Pressable
              style={styles.botonBarra}
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps/search/?api=1&query=${comercio.latitud},${comercio.longitud}`
                )
              }
            >
              <Ionicons name="navigate" size={16} color="#1e272e" />
              <Text style={styles.botonBarraTexto}>Cómo llegar</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: '#fff' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  error: { color: '#e11d48', fontSize: 15, textAlign: 'center' },
  scrollConBarra: { paddingBottom: 90 },
  fotoGaleria: { width: 340, height: 220, backgroundColor: '#eee' },
  fotoVacia: { width: '100%', height: 220 },
  cuerpo: { padding: 20 },
  filaCategoria: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoria: { color: '#e11d48', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  badgeDestacado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e11d48',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeDestacadoTexto: { color: '#fff', fontSize: 10, fontWeight: '800' },
  nombre: { fontSize: 22, fontWeight: '800', color: '#1e272e', marginTop: 4 },
  filaLocalidad: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  localidad: { color: '#636e72' },
  descripcion: { marginTop: 14, fontSize: 15, color: '#2d3436', lineHeight: 21 },
  bloque: { marginTop: 18 },
  bloqueTitulo: { fontWeight: '700', color: '#1e272e', marginBottom: 4 },
  bloqueTexto: { color: '#636e72' },
  redes: { flexDirection: 'row', gap: 18, marginTop: 20 },
  redItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  redLink: { color: '#e11d48', fontWeight: '600' },
  avisoFreemium: { marginTop: 24, color: '#9aa0a6', fontSize: 13, fontStyle: 'italic' },
  barraSticky: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 12,
    gap: 10,
  },
  botonBarra: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f4f4',
  },
  botonWhatsapp: { backgroundColor: '#25d366' },
  botonBarraTexto: { fontWeight: '700', color: '#1e272e' },
  botonBarraTextoBlanco: { fontWeight: '700', color: '#fff' },
});
