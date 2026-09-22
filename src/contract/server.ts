import { z } from 'zod';
import { Envelope } from './envelope';

/* ---------- Tipos compartidos ---------- */

/** Política de captura. Valores fijos: la restricción térmica vive en el tipo. */
export const CapturePolicy = z.object({
  /** 0.5 idle · 1 reposo · 2 trabajo · 4 solo ráfaga */
  fps: z.union([z.literal(0.5), z.literal(1), z.literal(2), z.literal(4)]),
  /** Lado largo en px. 1440 solo tiene sentido dentro de una ráfaga. */
  max_edge: z.union([z.literal(720), z.literal(1440)]),
  /** Si viene, es ráfaga: el cliente revierte solo al expirar. */
  duration_ms: z.number().int().min(500).max(15_000).optional(),
  /** required = honrar aunque cueste térmicamente · preferred = degradar en silencio */
  priority: z.enum(['required', 'preferred']).default('preferred'),
});
export type CapturePolicyType = z.infer<typeof CapturePolicy>;

/* ---------- Eventos servidor → cliente ---------- */

export const CapturePolicyEvent = z.object({
  t: z.literal('capture.policy'),
  policy: CapturePolicy,
  reason: z.enum(['idle', 'plate_detected', 'retry', 'manual']),
});

export const FramePinEvent = z.object({
  t: z.literal('frame.pin'),
  frame_id: z.string().ulid(),
  reason: z.enum(['evidence', 'retry']),
});

export const EquipmentIdentifiedEvent = z.object({
  t: z.literal('equipment.identified'),
  model: z.string().min(1),
  /** A veces se lee el modelo y no la serie. */
  serial: z.string().min(1).nullable(),
  confidence: z.number().min(0).max(1),
  source: z.enum(['ocr', 'manual']),
  evidence_frame_id: z.string().ulid(),
});

export const ProcedureSelectedEvent = z.object({
  t: z.literal('procedure.selected'),
  procedure_id: z.string().min(1),
  title: z.string().min(1),
  /** Estimados, no totales: con ramas no se sabe el total de antemano. */
  estimated_steps: z.number().int().positive(),
  context: z.object({
    equipment_family: z.string().min(1),
    /** Fijo en código en hito 1. */
    complaint: z.string().min(1),
  }),
});

export const AgentErrorEvent = z.object({
  t: z.literal('agent.error'),
  /** En hito 2 se abre a un enum. */
  code: z.literal('verify_inconclusive'),
  recoverable: z.literal(true),
  /** Ya redactado por el servidor; el cliente lo muestra tal cual. */
  user_message: z.string().min(1),
});

export const ServerPayload = z.discriminatedUnion('t', [
  CapturePolicyEvent,
  FramePinEvent,
  EquipmentIdentifiedEvent,
  ProcedureSelectedEvent,
  AgentErrorEvent,
]);
export type ServerPayloadType = z.infer<typeof ServerPayload>;

export const ServerEnvelope = Envelope(ServerPayload);
export type ServerEnvelopeType = z.infer<typeof ServerEnvelope>;
