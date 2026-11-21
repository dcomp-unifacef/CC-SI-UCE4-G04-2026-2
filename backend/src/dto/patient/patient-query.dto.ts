import { z } from 'zod';
import {
  dateOnlySchema,
  paginationSchema,
  parseDto,
  uuidSchema,
} from '../shared/zod';

export const patientQuerySchema = z
  .object({
    ...paginationSchema,
    search: z.string().trim().max(180).optional(),
    status: z.enum(['ACTIVE', 'PAUSED', 'INACTIVE', 'ALL']).default('ACTIVE'),
    cpapModelId: uuidSchema.optional(),
    filterType: z.enum(['WASHABLE', 'DISPOSABLE', 'UNKNOWN']).optional(),
    reportPlatform: z
      .enum(['AIRVIEW', 'CARE_ORCHESTRATOR', 'SMART_LIVE'])
      .optional(),
    maskModel: z.string().trim().max(160).optional(),
    physicianName: z.string().trim().max(180).optional(),
    minAge: z.coerce.number().int().min(0).max(130).optional(),
    maxAge: z.coerce.number().int().min(0).max(130).optional(),
    therapyStartFrom: dateOnlySchema.optional(),
    therapyStartTo: dateOnlySchema.optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.minAge === undefined ||
      value.maxAge === undefined ||
      value.minAge <= value.maxAge,
    {
      path: ['maxAge'],
      message: 'maxAge must be greater than or equal to minAge',
    },
  );

export type PatientQueryInput = z.infer<typeof patientQuerySchema>;

export class PatientQueryDto {
  static parse(value: unknown): PatientQueryInput {
    return parseDto(patientQuerySchema, value);
  }
}
