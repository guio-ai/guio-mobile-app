import { z } from 'zod';

/**
 * Sobre común a todos los eventos, en ambas direcciones.
 * Lo único que varía es el tipo del payload, por eso es una función.
 */
export const Envelope = <T extends z.ZodTypeAny>(payload: T) =>
  z.object({
    /** Versión del contrato. Mismatch = fallar duro, no adivinar. */
    v: z.literal(1),
    /** Identidad única del evento. Clave de idempotencia ante reintentos. */
    id: z.string().ulid(),
    /** Monotónico por emisor y sesión. Un hueco = se perdió algo. */
    seq: z.number().int().positive(),
    /** Epoch ms. El del cliente es advisory; el servidor lo corrige con offset. */
    ts: z.number().int().nonnegative(),
    /** El id que devuelve POST /sessions. */
    session_id: z.string().uuid(),
    /** Evento que provocó este. Opcional en hito 1; obligatorio para confirm.ack en hito 2. */
    causation_id: z.string().ulid().optional(),
    payload,
  });
