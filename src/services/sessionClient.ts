/**
 * sessionClient.ts — EL PUNTO DE ENCHUFE entre la interfaz y el mundo exterior.
 *
 * Regla de oro de este proyecto: las pantallas y componentes NUNCA hablan con
 * la red. Solo hablan con este archivo. Así, cuando Daniel implemente el
 * backend y LiveKit aquí dentro, ninguna pantalla tiene que cambiar.
 *
 * El archivo tiene cuatro partes, en este orden:
 *   0. INTERRUPTORES: constantes para activar/desactivar la simulación.
 *   1. TIPOS: qué estados existen y qué forma tiene el cliente.
 *   2. IMPLEMENTACIÓN: la clase que la interfaz usa. Los métodos de red están
 *      vacíos y marcados con ">>>" para saber exactamente dónde escribir.
 *   3. MODO SIMULACIÓN: recorre los estados con temporizadores, sin red.
 *      Se apaga con SIMULATE = false y se puede borrar entero (está aislado).
 *
 * Aquí NO hay React. Es TypeScript puro: una clase, una lista de suscriptores
 * y unos temporizadores. La pantalla se suscribe con onStateChange() y
 * redibuja cada vez que este archivo anuncia un estado nuevo.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 0. Interruptores
// ─────────────────────────────────────────────────────────────────────────────

/**
 * true  → startSession() finge la conexión con temporizadores (sin red).
 * false → startSession() ejecuta la implementación real (la de Daniel).
 */
const SIMULATE = true;

/**
 * Solo aplica si SIMULATE es true.
 * true → la simulación termina en "error" en vez de "ready", para probar el
 *        mensaje de error y el botón "Reintentar".
 */
const SIMULATE_FAILURE = false;

/** Milisegundos entre un estado y el siguiente en modo simulación. */
const SIMULATE_STEP_MS = 1500;

/** La pantalla lo usa para mostrar la etiqueta "MODO SIMULACIÓN". */
export const IS_SIMULATED = SIMULATE;

// ─────────────────────────────────────────────────────────────────────────────
// 1. Tipos
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Los cinco estados posibles de la sesión. El orden normal es:
 *   idle → connecting → waiting_agent → ready
 * y desde cualquiera se puede caer en "error".
 *
 * Ojo con la diferencia entre los dos del medio:
 *   - connecting:    pedimos la sesión y el teléfono está ENTRANDO a la sala.
 *   - waiting_agent: el teléfono YA está en la sala, pero el agente de IA no.
 *   - ready:         el agente ya está dentro como participante. Solo entonces.
 */
export type SessionState = 'idle' | 'connecting' | 'waiting_agent' | 'ready' | 'error';

/**
 * Forma de la respuesta que devuelve el backend en POST /sessions.
 * La interfaz no la usa; está declarada aquí para que los tipos de Daniel y
 * los de la app coincidan cuando él implemente startSession().
 */
export interface CreateSessionResponse {
  token: string;
  session: { id: string };
  room: { name: string };
  livekit: { url: string };
}

/**
 * Función que la interfaz registra para enterarse de cambios de estado.
 * `errorMessage` solo viene cuando `state` es "error".
 */
export type SessionStateListener = (state: SessionState, errorMessage?: string) => void;

/** Contrato que la interfaz conoce. Nada más de este archivo le importa. */
export interface SessionClient {
  /** Pide la sesión al backend y entra a la sala. Daniel implementa el cuerpo. */
  startSession(): Promise<void>;
  /** Cierra la sesión y sale de la sala. Daniel implementa el cuerpo. */
  endSession(): Promise<void>;
  /**
   * La interfaz se suscribe aquí para reaccionar a cambios de estado.
   * Devuelve una función que, al llamarla, cancela la suscripción.
   */
  onStateChange(listener: SessionStateListener): () => void;
  /**
   * Estado actual. La pantalla lo lee al aparecer para no arrancar
   * desincronizada si ya había una sesión en curso.
   */
  getState(): SessionState;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Implementación
// ─────────────────────────────────────────────────────────────────────────────

class GuioSessionClient implements SessionClient {
  private state: SessionState = 'idle';
  private listeners = new Set<SessionStateListener>();
  /** Temporizadores del modo simulación, para poder cancelarlos. */
  private simulationTimers: ReturnType<typeof setTimeout>[] = [];

  getState(): SessionState {
    return this.state;
  }

  onStateChange(listener: SessionStateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Cambia el estado y avisa a todos los suscriptores. Es el ÚNICO lugar
   * donde se toca `this.state`. Daniel: llama a esto desde tu código de red
   * cada vez que pase algo (entramos a la sala, llegó el agente, falló algo).
   *
   * Si lo llamas desde un callback de LiveKit (room.on(...)), usa una función
   * flecha `() => this.setState(...)` para que `this` siga siendo esta clase.
   */
  private setState(state: SessionState, errorMessage?: string): void {
    this.state = state;
    for (const listener of this.listeners) {
      listener(state, errorMessage);
    }
  }

  async startSession(): Promise<void> {
    // Si ya hay una sesión andando, ignoramos el toque repetido.
    if (this.state === 'connecting' || this.state === 'waiting_agent' || this.state === 'ready') {
      return;
    }

    if (SIMULATE) {
      this.runSimulation();
      return;
    }

    this.setState('connecting');
    try {
      // >>> AQUÍ ENCHUFA TU CLIENTE (Daniel): llamar a POST /sessions, luego conectar a LiveKit.
      // >>>   const res: CreateSessionResponse = await miBackend.createSession();
      // >>>   await room.connect(res.livekit.url, res.token);
      // >>>
      // >>> Cuando el teléfono entre a la sala: this.setState("waiting_agent");
      // >>> Cuando el agente aparezca como participante: this.setState("ready");
      // >>>
      // >>> Si algo falla, lanza un Error (o deja que se propague): el catch de
      // >>> abajo lo convierte en estado "error" con su mensaje.
      // >>> Borra la línea siguiente cuando tengas tu implementación:
      throw new Error('startSession() todavía no está implementado.');
    } catch (err) {
      this.setState('error', toErrorMessage(err));
    }
  }

  async endSession(): Promise<void> {
    this.cancelSimulation();

    if (SIMULATE) {
      this.setState('idle');
      return;
    }

    // >>> AQUÍ ENCHUFA TU CLIENTE (Daniel): desconectar de LiveKit
    // >>> (room.disconnect()) y, si aplica, avisar al backend que la sesión terminó.
    this.setState('idle');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. Modo simulación — solo para probar la pantalla. Se puede borrar entero.
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Recorre los estados con temporizadores:
   *   connecting (ya) → waiting_agent (1.5 s) → ready (3 s)
   * o, si SIMULATE_FAILURE es true:
   *   connecting (ya) → waiting_agent (1.5 s) → error (3 s)
   */
  private runSimulation(): void {
    this.cancelSimulation();
    this.setState('connecting');

    const schedule = (delayMs: number, run: () => void) => {
      this.simulationTimers.push(setTimeout(run, delayMs));
    };

    schedule(SIMULATE_STEP_MS, () => this.setState('waiting_agent'));

    if (SIMULATE_FAILURE) {
      schedule(SIMULATE_STEP_MS * 2, () =>
        this.setState('error', 'El copiloto no entró a la sala (simulado).'),
      );
    } else {
      schedule(SIMULATE_STEP_MS * 2, () => this.setState('ready'));
    }
  }

  /** Detiene cualquier simulación en curso (por ejemplo al tocar Finalizar). */
  private cancelSimulation(): void {
    for (const timer of this.simulationTimers) {
      clearTimeout(timer);
    }
    this.simulationTimers = [];
  }
}

/** Convierte cualquier cosa lanzada con `throw` en un texto corto para la pantalla. */
function toErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return 'Ocurrió un error inesperado.';
}

/**
 * Instancia única que usa toda la app. Se exporta con el tipo de la interfaz
 * (`SessionClient`) y no el de la clase, así la pantalla solo ve el contrato
 * público y nunca los detalles internos.
 */
export const sessionClient: SessionClient = new GuioSessionClient();
