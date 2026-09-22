/**
 * StatusBadge.tsx — El indicador de estado de conexión.
 *
 * ¿Qué es un COMPONENTE?
 * En React, un componente es una función que recibe datos (llamados "props",
 * de "properties") y devuelve la descripción de lo que se debe dibujar. Es
 * como una función que devuelve HTML, pero en React Native devuelve vistas
 * nativas (View, Text...) en vez de <div> y <span>. Cada vez que las props
 * cambian, React vuelve a ejecutar la función y actualiza la pantalla.
 *
 * Este componente recibe el estado de la sesión y muestra una tarjeta grande
 * donde cambian A LA VEZ tres cosas: el texto, el color de fondo y el ícono.
 * El texto es lo que manda; color e ícono solo lo refuerzan para que el
 * técnico lo distinga de un vistazo a un metro de distancia.
 */

import type { ComponentProps } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { SessionState } from '../services/sessionClient';
import { colors, fontSizes, sizes, spacing, statusColors } from '../theme';

/** Nombres de ícono válidos de Ionicons. Si escribes uno mal, TypeScript avisa. */
type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface StatusVisual {
  /** Etiqueta visible. Es obligatoria en todos los estados. */
  label: string;
  /** Ícono de Ionicons, o "spinner" para mostrar la ruedita animada nativa. */
  icon: IoniconName | 'spinner';
}

/** Qué se ve en cada estado. Los colores viven en theme.ts (statusColors). */
const VISUALS: Record<SessionState, StatusVisual> = {
  idle: { label: 'Listo para iniciar', icon: 'power' },
  connecting: { label: 'Conectando…', icon: 'spinner' },
  waiting_agent: { label: 'Esperando al copiloto…', icon: 'hourglass-outline' },
  ready: { label: 'Copiloto conectado', icon: 'checkmark-circle' },
  error: { label: 'Error de conexión', icon: 'alert-circle' },
};

interface StatusBadgeProps {
  state: SessionState;
  /** Detalle corto que se muestra debajo de la etiqueta cuando state es "error". */
  errorMessage?: string;
}

export function StatusBadge({ state, errorMessage }: StatusBadgeProps) {
  const visual = VISUALS[state];
  const color = statusColors[state];
  const showDetail = state === 'error' && errorMessage;

  return (
    // `style` acepta un arreglo: los estilos de la derecha pisan a los de la
    // izquierda. Así mezclamos el estilo fijo con el color que depende del estado.
    <View
      style={[styles.card, { backgroundColor: color }]}
      // Para lectores de pantalla: leen la tarjeta como un solo bloque.
      accessible
      accessibilityLabel={showDetail ? `${visual.label}. ${errorMessage}` : visual.label}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.iconCircle}>
        {visual.icon === 'spinner' ? (
          <ActivityIndicator size="large" color={color} />
        ) : (
          <Ionicons name={visual.icon} size={sizes.statusIconGlyph} color={color} />
        )}
      </View>

      <Text style={styles.label}>{visual.label}</Text>

      {showDetail ? <Text style={styles.detail}>{errorMessage}</Text> : null}
    </View>
  );
}

/**
 * StyleSheet.create es el equivalente a una hoja de estilos, pero local a
 * este archivo. Las propiedades se parecen a CSS pero en camelCase
 * (backgroundColor en vez de background-color) y sin unidades.
 */
const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: sizes.radius,
    gap: spacing.md,
  },
  iconCircle: {
    width: sizes.statusIconCircle,
    height: sizes.statusIconCircle,
    // La mitad del ancho convierte el cuadrado en círculo.
    borderRadius: sizes.statusIconCircle / 2,
    backgroundColor: colors.onStatus,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSizes.status,
    fontWeight: '700',
    color: colors.onStatus,
    textAlign: 'center',
  },
  detail: {
    fontSize: fontSizes.body,
    color: colors.onStatus,
    textAlign: 'center',
  },
});
