# Guio — app móvil (ticket GUI-5)

Esqueleto de la app móvil de Guio: una sola pantalla con el botón **Iniciar** y el
indicador de estado de conexión. Hecha con React Native + Expo en TypeScript estricto.

En este ticket **no hay red, ni LiveKit, ni tokens**. La interfaz habla únicamente con
`src/services/sessionClient.ts`, que hoy corre en modo simulación. Ese archivo es el
único lugar donde se enchufa el backend real (ver la última sección).

---

## 1. Requisitos

En la Mac:

| Herramienta                 | Para qué                         | Cómo comprobar  |
| --------------------------- | -------------------------------- | --------------- |
| Node.js LTS (20 o superior) | Ejecutar Expo y sus herramientas | `node -v`       |
| npm                         | Instalar dependencias            | `npm -v`        |
| Git                         | Control de versiones (opcional)  | `git --version` |

No hace falta Xcode, Android Studio ni Watchman.

En el teléfono:

- **Android:** instala **Expo Go** desde Google Play.
- **iPhone:** instala **Expo Go** desde la App Store.

Expo Go solo abre proyectos de su misma versión de SDK. Este proyecto usa **Expo SDK 57**
y Expo Go 57.x está en ambas tiendas (verificado el 15 de septiembre de 2026). Si en tu
tienda aparece una versión menor, avísame: el proyecto se puede crear en ese SDK con
`--template blank-typescript@sdk-NN`.

El teléfono y la Mac deben estar en la **misma red Wi‑Fi**.

## 2. Instalar

Si el proyecto ya existe (lo clonaste o lo tienes en disco):

```bash
cd guio-app
npm install
```

Si estás creándolo desde cero:

```bash
npx create-expo-app@latest guio-app --template blank-typescript
```

Después, dentro de la carpeta, agrega las dos únicas dependencias extra del proyecto:

```bash
npx expo install react-native-safe-area-context @expo/vector-icons
```

- `react-native-safe-area-context`: el `SafeAreaView` que trae React Native está
  marcado como obsoleto; este paquete es el reemplazo oficial y respeta notch y barra
  inferior en ambos sistemas.
- `@expo/vector-icons`: íconos vectoriales mantenidos por Expo. Nítidos a cualquier
  tamaño, cero imágenes que mantener.

`npx expo install` (en vez de `npm install`) elige la versión de cada paquete
compatible con tu SDK de Expo. Úsalo siempre para paquetes nativos.

## 3. Correr en el teléfono

```bash
npx expo start
```

Aparece un código QR en la terminal.

- **Android:** abre Expo Go → "Scan QR code" → apunta al QR.
- **iPhone:** abre la app **Cámara** del sistema → apunta al QR → toca el aviso
  "Abrir en Expo Go".

Deberías ver: el título **Guio**, la etiqueta **MODO SIMULACIÓN**, una tarjeta gris
con **"Listo para iniciar"** y abajo el botón **Iniciar**. Al tocar Iniciar la tarjeta
pasa por: Conectando… (ámbar) → Esperando al copiloto… (azul) → Copiloto conectado
(verde), con ~1.5 s entre cada uno. En verde, el botón dice **Finalizar** y vuelve a
"Listo para iniciar".

Para probar el error: en `src/services/sessionClient.ts` cambia
`SIMULATE_FAILURE = true`, guarda, y la app se recarga sola. Ahora termina en rojo con
el mensaje y el botón **Reintentar**.

Si el QR no conecta (redes corporativas o de invitados suelen bloquearlo):

```bash
npx expo start --tunnel
```

Otros comandos útiles mientras `expo start` corre: `r` recarga la app, `j` abre el
depurador, `?` muestra todos.

## 4. Qué hace cada archivo

```
guio-app/
  app.json                      Configuración de Expo. Aquí está "orientation": "portrait"
                                (vertical fija) y supportsTablet: false (solo teléfono).
  index.ts                      Encendido. Registra App como componente raíz. No se toca.
  App.tsx                       Componente raíz: SafeAreaProvider + barra de estado + HomeScreen.
  package.json                  Dependencias y scripts (npm start = expo start).
  tsconfig.json                 TypeScript estricto (strict: true).
  src/
    theme.ts                    Sistema visual: colores, tamaños de texto, espaciados, medidas.
                                Todo lo visual sale de aquí; ningún componente inventa valores.
    services/
      sessionClient.ts          EL PUNTO DE ENCHUFE. Tipos, cliente de sesión y modo simulación.
    screens/
      HomeScreen.tsx            La pantalla. Se suscribe al cliente y decide qué hace el botón.
    components/
      StatusBadge.tsx           Tarjeta de estado: texto + color + ícono cambian a la vez.
      PrimaryButton.tsx         Botón grande (72 pt de alto, ancho completo, solo toque).
  assets/                       Ícono de la app y splash (los que trae la plantilla).
  AGENTS.md, CLAUDE.md, .claude/ Generados por create-expo-app para asistentes de IA. Inofensivos.
```

Flujo de datos, en una línea: `sessionClient` anuncia un estado → `HomeScreen` lo guarda
con `useState` → `StatusBadge` y `PrimaryButton` se redibujan con ese estado.

## 5. Dónde enchufar el cliente real

Abre `src/services/sessionClient.ts`. Todo lo que tienes que hacer está en ese archivo.

1. **Apaga la simulación:** `const SIMULATE = false;` (arriba del todo).
2. **`startSession()`** — busca el bloque que empieza con
   `// >>> AQUÍ ENCHUFA TU CLIENTE (Daniel)`. Dentro del `try`:
   - Llama a `POST /sessions`. La respuesta tiene la forma de `CreateSessionResponse`
     (ya declarada en el archivo).
   - Conecta a LiveKit con `res.livekit.url` y `res.token`.
   - Cuando el teléfono entre a la sala: `this.setState("waiting_agent")`.
   - Cuando el agente aparezca como participante: `this.setState("ready")`.
   - Si algo falla, lanza un `Error` con un mensaje corto: el `catch` ya lo convierte
     en estado `"error"` y la pantalla lo muestra con el botón Reintentar.
   - Borra la línea `throw new Error("startSession() todavía no está implementado.")`.
3. **`endSession()`** — en su comentario `>>>`: desconecta de LiveKit y, si aplica,
   avisa al backend. Deja el `this.setState("idle")` final.
4. Si llamas a `this.setState(...)` desde un callback de LiveKit (`room.on(...)`), usa
   función flecha para conservar `this`.
5. Cuando todo funcione, puedes borrar la sección "3. Modo simulación" completa y las
   constantes `SIMULATE_*`. Nada fuera de ese archivo depende de ellas, salvo la
   etiqueta "MODO SIMULACIÓN" que desaparece sola al poner `SIMULATE = false`.

Regla que mantiene sano el proyecto: **ninguna pantalla ni componente importa nada de
red**. Si mañana necesitas exponer algo más a la interfaz (por ejemplo el nombre de la
sala), agrégalo a la interfaz `SessionClient` y sal por ahí.

## 6. Decisiones de diseño (por qué se ve así)

- Fondo blanco y texto casi negro: contraste ≥ 9:1 en todo el texto sobre fondo claro.
- Colores de estado oscuros con texto blanco encima: contraste ≥ 7:1 (AAA). Se leen al sol.
- Texto de estado a 26 pt, botón a 22 pt (el ticket pedía ≥ 20 y ≥ 18).
- Botón principal de 72 pt de alto y ancho completo, anclado abajo: alcance del pulgar.
- Solo toques simples. Ningún gesto de deslizar ni mantener presionado.
- Cada estado cambia texto, color e ícono a la vez; el texto es el que manda.
