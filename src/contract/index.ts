import { z } from 'zod';
import { ServerEnvelope } from './server';
import { ClientEnvelope } from './client';

export * from './envelope';
export * from './server';
export * from './client';

/** Cualquier evento válido del hito 1, de cualquier lado. */
export const AnyEnvelope = z.union([ServerEnvelope, ClientEnvelope]);
export type AnyEnvelopeType = z.infer<typeof AnyEnvelope>;

/** Forma del fixture golden_session.json */
export const GoldenSession = z.object({
  session_id: z.string().uuid(),
  note: z.string(),
  events: z.array(AnyEnvelope),
});
