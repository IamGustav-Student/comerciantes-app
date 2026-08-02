import { View, Text, Pressable, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, shadow } from '../constants/theme';

export type ItemInfo = {
  icono: keyof typeof Ionicons.glyphMap;
  etiqueta: string;
  numero?: string;
  nota?: string;
};

type Props = {
  titulo: string;
  subtitulo?: string;
  items: ItemInfo[];
  colorAcento: string;
};

export default function SeccionInfoEstatica({ titulo, subtitulo, items, colorAcento }: Props) {
  return (
    <View style={styles.seccion}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>{titulo}</Text>
        {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
      </View>
      <View style={styles.grilla}>
        {items.map((item) => {
          const llamable = !!item.numero;
          return (
            <Pressable
              key={item.etiqueta}
              style={({ pressed }) => [styles.tarjeta, pressed && llamable && styles.presionado]}
              onPress={() => llamable && Linking.openURL(`tel:${item.numero!.replace(/\s/g, '')}`)}
              disabled={!llamable}
            >
              <View style={[styles.icono, { backgroundColor: `${colorAcento}1A` }]}>
                <Ionicons name={item.icono} size={20} color={colorAcento} />
              </View>
              <Text style={styles.etiqueta} numberOfLines={2}>
                {item.etiqueta}
              </Text>
              <Text style={[styles.valor, llamable && { color: colorAcento }]} numberOfLines={1}>
                {item.numero || item.nota}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  seccion: { marginBottom: spacing.lg },
  encabezado: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm + 2 },
  titulo: { fontFamily: fonts.bold, fontSize: 16, color: colors.textStrong },
  subtitulo: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  grilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg - 5,
    gap: 10,
  },
  tarjeta: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.suave,
  },
  presionado: { opacity: 0.7 },
  icono: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  etiqueta: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.textStrong, marginBottom: 3 },
  valor: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
});
