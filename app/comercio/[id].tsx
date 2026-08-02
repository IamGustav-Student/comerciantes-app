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
          <Text style={styles.categoria}>{comercio.categoria_nombre || 'Comercio'}</Text>
          <Text style={styles.nombre}>{comercio.nombre_negocio}</Text>
          {comercio.localidad_nombre ? (
            <Text style={styles.localidad}>📍 {comercio.localidad_nombre}</Text>
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
                onPress={() =>
                  Linking.openURL(`https://instagram.com/${comercio.instagram!.replace('@', '')}`)
                }
              >
                <Text style={styles.redLink}>Instagram</Text>
              </Pressable>
            ) : null}
            {comercio.facebook ? (
              <Pressable onPress={() => Linking.openURL(comercio.facebook!)}>
                <Text style={styles.redLink}>Facebook</Text>
              </Pressable>
            ) : null}
            {comercio.sitio_web ? (
              <Pressable onPress={() => Linking.openURL(comercio.sitio_web!)}>
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
            <Text style={styles.botonBarraTexto}>📞 Llamar</Text>
          </Pressable>

          {numeroWhatsapp ? (
            <Pressable
              style={[styles.botonBarra, styles.botonWhatsapp]}
              onPress={() => Linking.openURL(`https://wa.me/${numeroWhatsapp}`)}
            >
              <Text style={styles.botonBarraTextoBlanco}>💬 WhatsApp</Text>
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
              <Text style={styles.botonBarraTexto}>🗺️ Cómo llegar</Text>
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
  categoria: { color: '#e11d48', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  nombre: { fontSize: 22, fontWeight: '800', color: '#1e272e', marginTop: 4 },
  localidad: { color: '#636e72', marginTop: 4 },
  descripcion: { marginTop: 14, fontSize: 15, color: '#2d3436', lineHeight: 21 },
  bloque: { marginTop: 18 },
  bloqueTitulo: { fontWeight: '700', color: '#1e272e', marginBottom: 4 },
  bloqueTexto: { color: '#636e72' },
  redes: { flexDirection: 'row', gap: 16, marginTop: 20 },
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
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  botonWhatsapp: { backgroundColor: '#25d366' },
  botonBarraTexto: { fontWeight: '700', color: '#1e272e' },
  botonBarraTextoBlanco: { fontWeight: '700', color: '#fff' },
});
