/**
 * App.tsx — El componente raíz de la app.
 *
 * ¿Cómo llega la app hasta aquí? Expo arranca por `index.ts` (está en
 * package.json, campo "main"), que llama a registerRootComponent(App). Es
 * decir: index.ts es el "encendido" y App.tsx es lo primero que se dibuja.
 *
 * Este archivo hace tres cosas y nada más:
 * 1. Envuelve todo en SafeAreaProvider, que mide el notch y las barras del
 *    teléfono para que SafeAreaView (en HomeScreen) sepa cuánto espacio dejar.
 * 2. Pone la barra de estado del sistema (hora, batería) en texto oscuro,
 *    porque nuestro fondo es blanco.
 * 3. Muestra la única pantalla de este ticket.
 *
 * Cuando haya más pantallas, la navegación entre ellas se configurará aquí.
 */

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <HomeScreen />
    </SafeAreaProvider>
  );
}
