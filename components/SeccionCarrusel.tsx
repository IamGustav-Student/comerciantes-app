import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Comercio } from '../lib/api';
import { colors, fonts, spacing } from '../constants/theme';
import TarjetaComercio from './TarjetaComercio';

type Props = {
  titulo: string;
  subtitulo?: string;
  comercios: Comercio[];
  colorAcento: string;
  onVerTodos?: () => void;
};

const ANCHO_TARJETA = 168;

export default function SeccionCarrusel({ titulo, subtitulo, comercios, colorAcento, onVerTodos }: Props) {
  if (comercios.length === 0) return null;

  return (
    <View style={styles.seccion}>
      <View style={styles.encabezado}>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>{titulo}</Text>
          {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
        </View>
        {onVerTodos ? (
          <Pressable onPress={onVerTodos} style={({ pressed }) => pressed && { opacity: 0.6 }} hitSlop={8}>
            <View style={styles.verTodos}>
              <Text style={[styles.verTodosTexto, { color: colorAcento }]}>Ver todos</Text>
              <Ionicons name="chevron-forward" size={14} color={colorAcento} />
            </View>
          </Pressable>
        ) : null}
      </View>
      <FlatList
        data={comercios}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <TarjetaComercio
            comercio={item}
            colorAcento={colorAcento}
            estiloContenedor={{ width: ANCHO_TARJETA }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  seccion: { marginBottom: spacing.md },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm + 2,
  },
  titulo: { fontFamily: fonts.bold, fontSize: 16, color: colors.textStrong },
  subtitulo: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  verTodos: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  verTodosTexto: { fontFamily: fonts.semiBold, fontSize: 12.5 },
  lista: { paddingHorizontal: spacing.lg, gap: 10 },
});
