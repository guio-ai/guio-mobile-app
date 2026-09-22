/**
 * PrimaryButton.tsx — El botón grande de la pantalla (Iniciar / Reintentar / Finalizar).
 *
 * Es un componente "tonto": no sabe nada de sesiones ni estados. Solo recibe
 * un texto, una función a ejecutar al tocarlo y si está deshabilitado. Toda
 * la lógica de qué texto mostrar y qué hacer vive en HomeScreen.tsx. Separar
 * así permite reutilizarlo y probarlo por separado.
 *
 * Decisiones de diseño (ticket GUI-5):
 * - Ocupa todo el ancho disponible y mide 72 pt de alto (el mínimo era 64).
 * - Responde solo a un toque simple. Nada de mantener presionado ni deslizar.
 * - Al tocarlo cambia de color para confirmar que el toque entró (importante
 *   con guantes, donde el tacto no siempre se siente).
 */

import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSizes, sizes } from '../theme';

interface PrimaryButtonProps {
  /** Texto del botón. */
  label: string;
  /** Qué hacer al tocarlo. */
  onPress: () => void;
  /** Si es true, se ve apagado y no responde. Por defecto false. */
  disabled?: boolean;
}

export function PrimaryButton({ label, onPress, disabled = false }: PrimaryButtonProps) {
  return (
    // Pressable es el componente nativo para "algo que se puede tocar".
    // `style` puede ser una función que recibe `pressed` (true mientras el
    // dedo está encima), y así cambiamos el color durante el toque.
    <Pressable
      onPress={onPress}
      disabled={disabled}
      // Estas dos props le dicen al lector de pantalla que esto es un botón y
      // si está activo. No cambian nada visual.
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: sizes.buttonHeight,
    // alignSelf: "stretch" hace que ocupe todo el ancho de su contenedor.
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: sizes.radius,
    backgroundColor: colors.buttonBackground,
  },
  buttonPressed: {
    backgroundColor: colors.buttonPressed,
  },
  buttonDisabled: {
    backgroundColor: colors.buttonDisabledBackground,
  },
  label: {
    fontSize: fontSizes.button,
    fontWeight: '700',
    color: colors.buttonText,
    // Un poco de espacio entre letras ayuda a la lectura desde lejos.
    letterSpacing: 0.5,
  },
  labelDisabled: {
    color: colors.buttonDisabledText,
  },
});
