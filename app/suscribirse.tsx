import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  fetchPlanes,
  fetchCategorias,
  crearSuscripcion,
  Plan,
  Categoria,
} from '../lib/api';

export default function SuscribirseScreen() {
  const router = useRouter();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [planSlug, setPlanSlug] = useState<string | null>(null);
  const [categoriaSlug, setCategoriaSlug] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');

  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<'gratuito' | 'pago' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchPlanes(), fetchCategorias()])
      .then(([p, c]) => {
        setPlanes(p);
        setCategorias(c);
        if (p.length > 0) setPlanSlug(p[0].slug);
      })
      .catch(() => setError('No pudimos cargar los planes. Revisá tu conexión.'))
      .finally(() => setCargando(false));
  }, []);

  const formularioValido =
    !!planSlug && businessName.trim() && phone.trim() && address.trim() &&
    ownerName.trim() && email.trim() && dni.trim();

  const onEnviar = async () => {
    if (!formularioValido || !planSlug) return;
    setEnviando(true);
    setError(null);
    try {
      const respuesta = await crearSuscripcion({
        plan: planSlug,
        businessName: businessName.trim(),
        category: categoriaSlug || undefined,
        phone: phone.trim(),
        address: address.trim(),
        description: description.trim() || undefined,
        ownerName: ownerName.trim(),
        email: email.trim(),
        dni: dni.trim(),
        whatsapp: whatsapp.trim() || undefined,
        instagram: instagram.trim() || undefined,
      });

      if (respuesta.initPoint) {
        setResultado('pago');
        const puedeAbrir = await Linking.canOpenURL(respuesta.initPoint);
        if (puedeAbrir) Linking.openURL(respuesta.initPoint);
      } else {
        setResultado('gratuito');
      }
    } catch (e: any) {
      Alert.alert('No pudimos completar el registro', e.message || 'Intentá de nuevo en un momento.');
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#e11d48" />
      </View>
    );
  }

  if (resultado) {
    return (
      <View style={styles.centro}>
        <Stack.Screen options={{ title: 'Sumá tu comercio' }} />
        <Text style={styles.resultadoEmoji}>{resultado === 'pago' ? '💳' : '🎉'}</Text>
        <Text style={styles.resultadoTitulo}>
          {resultado === 'pago' ? 'Casi listo' : '¡Listo!'}
        </Text>
        <Text style={styles.resultadoTexto}>
          {resultado === 'pago'
            ? 'Te abrimos Mercado Pago para completar el pago. En cuanto se acredite, tu comercio queda activo en la guía.'
            : 'Tu comercio quedó cargado. Nuestro equipo lo revisa y lo activa en las próximas 48hs.'}
        </Text>
        <Pressable style={styles.botonVolver} onPress={() => router.back()}>
          <Text style={styles.botonVolverTexto}>Volver a la guía</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.raiz} contentContainerStyle={styles.contenido}>
      <Stack.Screen options={{ title: 'Sumá tu comercio' }} />

      <Text style={styles.seccionTitulo}>Elegí tu plan</Text>
      <View style={styles.planes}>
        {planes.map((plan) => {
          const activo = planSlug === plan.slug;
          return (
            <Pressable
              key={plan.slug}
              style={[styles.planCard, activo && styles.planCardActiva]}
              onPress={() => setPlanSlug(plan.slug)}
            >
              <Text style={[styles.planNombre, activo && styles.planTextoActivo]}>{plan.nombre}</Text>
              <Text style={[styles.planPrecio, activo && styles.planTextoActivo]}>
                {plan.precio > 0 ? `$${plan.precio.toLocaleString('es-AR')}` : 'Gratis'}
              </Text>
              {plan.precio > 0 ? (
                <Text style={[styles.planPeriodo, activo && styles.planTextoActivo]}>
                  / {plan.periodicidad}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.seccionTitulo}>Rubro</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasScroll}>
        {categorias.map((cat) => {
          const activa = categoriaSlug === cat.slug;
          return (
            <Pressable
              key={cat.slug}
              style={[styles.chip, activa && styles.chipActivo]}
              onPress={() => setCategoriaSlug(activa ? null : cat.slug)}
            >
              <Text style={[styles.chipTexto, activa && styles.chipTextoActivo]}>{cat.nombre}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.seccionTitulo}>Datos del negocio</Text>
      <TextInput style={styles.input} placeholder="Nombre del negocio *" value={businessName} onChangeText={setBusinessName} />
      <TextInput style={styles.input} placeholder="Teléfono *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Dirección *" value={address} onChangeText={setAddress} />
      <TextInput
        style={[styles.input, styles.inputMultilinea]}
        placeholder="Descripción breve de tu negocio"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />
      <TextInput style={styles.input} placeholder="WhatsApp (opcional)" value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Instagram (opcional)" value={instagram} onChangeText={setInstagram} autoCapitalize="none" />

      <Text style={styles.seccionTitulo}>Tus datos (titular)</Text>
      <TextInput style={styles.input} placeholder="Tu nombre completo *" value={ownerName} onChangeText={setOwnerName} />
      <TextInput style={styles.input} placeholder="Tu email *" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Tu DNI *" value={dni} onChangeText={setDni} keyboardType="number-pad" />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.botonEnviar, !formularioValido && styles.botonDeshabilitado]}
        disabled={!formularioValido || enviando}
        onPress={onEnviar}
      >
        {enviando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botonEnviarTexto}>Enviar suscripción</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: '#f4f7f6' },
  contenido: { padding: 20, paddingBottom: 60 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  seccionTitulo: { fontWeight: '700', fontSize: 15, color: '#1e272e', marginTop: 18, marginBottom: 10 },
  planes: { flexDirection: 'row', gap: 10 },
  planCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    padding: 12,
    alignItems: 'center',
  },
  planCardActiva: { backgroundColor: '#e11d48', borderColor: '#e11d48' },
  planNombre: { fontWeight: '700', fontSize: 12, color: '#1e272e', textAlign: 'center' },
  planPrecio: { fontWeight: '800', fontSize: 15, color: '#1e272e', marginTop: 4 },
  planPeriodo: { fontSize: 10, color: '#888' },
  planTextoActivo: { color: '#fff' },
  categoriasScroll: { flexGrow: 0 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  chipActivo: { backgroundColor: '#e11d48', borderColor: '#e11d48' },
  chipTexto: { fontSize: 13, fontWeight: '600', color: '#4a4a4a' },
  chipTextoActivo: { color: '#fff' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    padding: 12,
    fontSize: 14,
    marginBottom: 10,
  },
  inputMultilinea: { minHeight: 80, textAlignVertical: 'top' },
  error: { color: '#e11d48', textAlign: 'center', marginTop: 8 },
  botonEnviar: {
    backgroundColor: '#e11d48',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  botonDeshabilitado: { backgroundColor: '#e5b1bd' },
  botonEnviarTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  resultadoEmoji: { fontSize: 48, marginBottom: 12 },
  resultadoTitulo: { fontSize: 20, fontWeight: '800', color: '#1e272e', marginBottom: 8 },
  resultadoTexto: { fontSize: 14, color: '#636e72', textAlign: 'center', lineHeight: 20 },
  botonVolver: { marginTop: 24, paddingHorizontal: 20, paddingVertical: 12 },
  botonVolverTexto: { color: '#e11d48', fontWeight: '700' },
});
