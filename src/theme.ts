/**
 * theme.ts — El sistema visual de Guio, en un solo lugar.
 *
 * ¿Por qué existe este archivo?
 * En React Native no hay hojas de estilo CSS globales: cada componente define
 * sus estilos en código. Si cada archivo inventara sus propios colores y
 * tamaños, la app se vería inconsistente y cambiar algo sería doloroso.
 * Aquí se decide UNA vez y todos los demás archivos importan de aquí.
 *
 * Reglas que cumplen estos valores (vienen del ticket GUI-5):
 * - Contraste alto de verdad: la app se usa en una azotea, bajo el sol.
 * - Tipografía grande: texto de estado >= 20 pt, texto del botón >= 18 pt.
 * - Targets grandes: botón principal >= 64 pt de alto, nada tocable < 48 pt.
 *
 * Nota sobre unidades: en React Native los tamaños no llevan "px". Son
 * puntos independientes de la densidad de la pantalla (dp en Android, pt en
 * iOS). Un valor de 16 se ve casi igual de grande en cualquier teléfono.
 *
 * `as const` al final de cada objeto le dice a TypeScript que estos valores
 * son fijos, así que si escribes `spacing.medium` (que no existe) el editor
 * te avisa en vez de fallar en el teléfono.
 */

import type { SessionState } from './services/sessionClient';

export const colors = {
  /** Fondo de toda la pantalla. Blanco puro para máximo contraste al sol. */
  background: '#FFFFFF',
  /** Texto principal: casi negro. Contraste ~17:1 sobre blanco. */
  text: '#0F172A',
  /** Texto secundario. Sigue siendo oscuro (contraste ~9:1). Nunca gris claro. */
  textMuted: '#334155',
  /** Bordes sutiles, por ejemplo el de la etiqueta "modo simulación". */
  border: '#94A3B8',

  /** Botón principal. */
  buttonBackground: '#0F172A',
  buttonText: '#FFFFFF',
  /** Color del botón mientras el dedo está encima (feedback de toque). */
  buttonPressed: '#334155',
  /**
   * Botón deshabilitado: más claro que el activo para notarse apagado, pero
   * todavía oscuro (contraste ~7.6:1 con texto blanco). Un gris medio típico
   * de "disabled" no se lee bajo el sol.
   */
  buttonDisabledBackground: '#475569',
  buttonDisabledText: '#FFFFFF',

  /** Texto e íconos que van ENCIMA de los colores de estado (todos oscuros). */
  onStatus: '#FFFFFF',
} as const;

/**
 * Un color por estado de conexión. Todos son tonos oscuros para que el texto
 * blanco encima tenga contraste >= 7:1 (nivel AAA de accesibilidad).
 *
 * `Record<SessionState, string>` obliga a que haya exactamente una entrada por
 * cada estado. Si mañana se agrega un estado nuevo en sessionClient.ts,
 * TypeScript marcará este objeto como incompleto hasta que le des color.
 */
export const statusColors: Record<SessionState, string> = {
  idle: '#1F2937', // gris pizarra: apagado, en reposo
  connecting: '#92400E', // ámbar oscuro: algo está pasando
  waiting_agent: '#1E40AF', // azul: ya entramos, falta el copiloto
  ready: '#166534', // verde: todo listo
  error: '#991B1B', // rojo: falló
};

export const fontSizes = {
  /** Nombre de la app en la cabecera. */
  brand: 30,
  /** Etiqueta del estado. El ticket exige >= 20; usamos 26 para leerse a 1 m. */
  status: 26,
  /** Texto del botón principal. El ticket exige >= 18. */
  button: 22,
  /** Texto de apoyo: subtítulo, mensaje de error. */
  body: 18,
  /** Etiquetas pequeñas (ej. "MODO SIMULACIÓN"). Es el mínimo que permitimos. */
  caption: 14,
} as const;

/** Espaciados en escala. Usa siempre uno de estos, no números sueltos. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const sizes = {
  /** Alto del botón principal. El ticket exige >= 64. */
  buttonHeight: 72,
  /** Alto y ancho mínimos de cualquier cosa tocable. */
  minTouchTarget: 48,
  /** Diámetro del círculo blanco donde vive el ícono de estado. */
  statusIconCircle: 96,
  /** Tamaño del ícono dentro de ese círculo. */
  statusIconGlyph: 52,
  /** Redondeo de esquinas de tarjetas y botones. */
  radius: 20,
} as const;
