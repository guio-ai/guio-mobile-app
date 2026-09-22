/**
 * HomeScreen.tsx — La única pantalla de este ticket.
 *
 * Aquí se juntan las piezas: lee el estado de la sesión desde sessionClient,
 * lo pasa a StatusBadge para mostrarlo, y decide qué texto y acción lleva el
 * botón grande. No hay nada de red aquí; todo pasa por sessionClient.ts.
 *
 * Dos conceptos de React que aparecen por primera vez:
 *
 * ESTADO (useState): un dato que, cuando cambia, hace que React redibuje el
 *   componente. `const [valor, setValor] = useState(inicial)` devuelve el
 *   valor actual y una función para cambiarlo. Nunca se cambia el valor
 *   directamente; siempre con la función, para que React se entere.
 *
 * HOOK: cualquier función de React que empieza con "use" (useState, useEffect)
 *   y "engancha" al componente con alguna capacidad: recordar datos, ejecutar
 *   algo cuando aparece en pantalla, etc. Solo se pueden llamar en el nivel
 *   superior de un componente, nunca dentro de un if ni de un bucle.
 *
 * useEffect(fn, []): ejecuta `fn` UNA vez, cuando el componente aparece en
 *   pantalla. Si `fn` devuelve otra función, React la ejecuta cuando el
 *   componente desaparece. Lo usamos para suscribirnos al cliente al entrar y
 *   cancelar la suscripción al salir, y así no dejar oyentes huérfanos.
 */

import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components/PrimaryButton';
import { StatusBadge } from '../components/StatusBadge';
import { IS_SIMULATED, sessionClient, type SessionState } from '../services/sessionClient';
import { colors, fontSizes, sizes, spacing } from '../theme';

/** Qué texto lleva el botón y qué hace, según el estado. */
interface ButtonAction {
  label: string;
  onPress: () => void;
  disabled: boolean;
}

function getButtonAction(state: SessionState): ButtonAction {
  // `void` delante de una promesa significa "no espero el resultado aquí".
  // El resultado llega por onStateChange, no por el valor de retorno.
  const start = () => {
    void sessionClient.startSession();
  };
  const end = () => {
    void sessionClient.endSession();
  };

  switch (state) {
    case 'idle':
      return { label: 'Iniciar', onPress: start, disabled: false };
    case 'connecting':
    case 'waiting_agent':
      // Mientras se conecta, el botón se ve apagado para no permitir
      // toques repetidos. El progreso ya lo cuenta la tarjeta de estado.
      return { label: 'Iniciando…', onPress: () => {}, disabled: true };
    case 'ready':
      return { label: 'Finalizar', onPress: end, disabled: false };
    case 'error':
      return { label: 'Reintentar', onPress: start, disabled: false };
  }
}

export function HomeScreen() {
  // Arrancamos con el estado que el cliente ya tenga (normalmente "idle").
  const [state, setState] = useState<SessionState>(() => sessionClient.getState());
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Cada vez que sessionClient anuncie un estado nuevo, lo guardamos con
    // setState y React redibuja la pantalla con el valor actualizado.
    const unsubscribe = sessionClient.onStateChange((nextState, message) => {
      setState(nextState);
      setErrorMessage(message);
    });
    // Al desaparecer la pantalla, dejamos de escuchar.
    return unsubscribe;
  }, []);

  const action = getButtonAction(state);

  return (
    // SafeAreaView deja libres el notch, la barra de estado y la barra
    // inferior de gestos, para que nada quede tapado ni imposible de tocar.
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.brand}>Guio</Text>
        <Text style={styles.tagline}>Copiloto de campo</Text>
        {IS_SIMULATED ? (
          <View style={styles.simulationTag}>
            <Text style={styles.simulationTagText}>MODO SIMULACIÓN</Text>
          </View>
        ) : null}
      </View>

      {/* flex: 1 hace que esta zona ocupe todo el alto sobrante y centre la tarjeta. */}
      <View style={styles.statusArea}>
        <StatusBadge state={state} errorMessage={errorMessage} />
      </View>

      {/* Zona de acciones: siempre abajo, al alcance del pulgar. */}
      <View style={styles.actions}>
        <PrimaryButton label={action.label} onPress={action.onPress} disabled={action.disabled} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingTop: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  brand: {
    fontSize: fontSizes.brand,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: fontSizes.body,
    color: colors.textMuted,
  },
  simulationTag: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: sizes.radius,
    borderWidth: 1,
    borderColor: colors.border,
  },
  simulationTagText: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  statusArea: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  actions: {
    paddingBottom: spacing.lg,
  },
});
