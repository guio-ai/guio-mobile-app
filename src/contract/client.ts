import { z } from 'zod';
import { Envelope } from './envelope';

/* ---------- Eventos cliente → servidor ---------- */

/** Etiqueta de un cuadro que viajó por el track de video. NO lleva la imagen. */
export const FrameEvent = z.object({
  t: z.literal('frame'),
  /** Asignado en el cliente al capturar. Llave de todo lo que refiera al cuadro. */
  frame_id: z.string().ulid(),
  /** Momento de captura; pegamento para correlacionar con el track. */
  ts: z.number().int().nonnegative(),
  /** 0 = nítido, 1 = inservible. El cliente descarta bajo umbral antes de emitir. */
  blur_score: z.number().min(0).max(1),
});

/** Respuesta honesta a capture.policy: lo que se logró, no lo que se pidió. */
export const CaptureAppliedEvent = z.object({
  t: z.literal('capture.applied'),
  fps: z.union([z.literal(0.5), z.literal(1), z.literal(2), z.literal(4)]),
  max_edge: z.union([z.literal(720), z.literal(1440)]),
  /** null = se cumplió tal cual. */
  degraded_by: z.enum(['thermal', 'bandwidth', 'battery', 'permission']).nullable(),
});

/** El cliente ya no tiene el cuadro pedido en frame.pin (ring buffer de 90 s). */
export const FrameMissingEvent = z.object({
  t: z.literal('frame.missing'),
  frame_id: z.string().ulid(),
});

/** Entrada manual del técnico. Lleva evidencia aunque la placa sea ilegible. */
export const EquipmentManualEvent = z.object({
  t: z.literal('equipment.manual'),
  model: z.string().min(1),
  serial: z.string().min(1).nullable(),
  evidence_frame_id: z.string().ulid(),
});

export const ClientPayload = z.discriminatedUnion('t', [
  FrameEvent,
  CaptureAppliedEvent,
  FrameMissingEvent,
  EquipmentManualEvent,
]);
export type ClientPayloadType = z.infer<typeof ClientPayload>;

export const ClientEnvelope = Envelope(ClientPayload);
export type ClientEnvelopeType = z.infer<typeof ClientEnvelope>;
