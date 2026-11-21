import { z } from 'zod';
import { parseDto } from '../shared/zod';

export const portalParamSchema = z
  .object({
    platform: z.enum(['AIRVIEW', 'CARE_ORCHESTRATOR', 'SMART_LIVE']),
  })
  .strict();

export class PortalParamDto {
  static parse(value: unknown) {
    return parseDto(portalParamSchema, value);
  }
}
