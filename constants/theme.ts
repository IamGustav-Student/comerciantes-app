// Tokens de diseño compartidos - misma paleta e identidad que comerciantes.com.ar
// (comerciantes, single-comercio) y agrocomercios.com.ar (agro), para que la app
// se sienta parte del mismo ecosistema en vez de un producto aparte.

export const colors = {
  primary: '#e11d48',
  primaryDark: '#b3123a',
  primarySoft: '#fdeef1',
  agro: '#2D5A27',
  agroSoft: '#eaf2e9',

  textStrong: '#1e272e',
  textBody: '#3a4148',
  textMuted: '#636e72',
  textFaint: '#9aa0a6',

  background: '#f4f7f6',
  surface: '#ffffff',
  border: '#e8e8e8',
  skeleton: '#e8e8e8',

  success: '#25d366',
  danger: '#e11d48',
} as const;

export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const shadow = {
  card: {
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  suave: {
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
} as const;
