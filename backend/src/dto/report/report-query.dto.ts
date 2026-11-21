import { z } from 'zod';
import {
  dateOnlySchema,
  paginationSchema,
  parseDto,
  uuidSchema,
} from '../shared/zod';

export const reportQuerySchema = z
  .object({
    ...paginationSchema,
    status: z
      .enum([
        'AWAITING_MATCH',
        'PROCESSING',
        'REVIEW_REQUIRED',
        'APPROVED',
        'SENT',
        'FAILED',
      ])
      .optional(),
    matchStatus: z
      .enum(['MATCHED', 'REVIEW_REQUIRED', 'UNMATCHED', 'MANUAL'])
      .optional(),
    platform: z
      .enum(['AIRVIEW', 'CARE_ORCHESTRATOR', 'SMART_LIVE', 'MANUAL'])
      .optional(),
    patientId: uuidSchema.optional(),
    periodFrom: dateOnlySchema.optional(),
    periodTo: dateOnlySchema.optional(),
  })
  .strict();

export type ReportQueryInput = z.infer<typeof reportQuerySchema>;

export class ReportQueryDto {
  static parse(value: unknown): ReportQueryInput {
    return parseDto(reportQuerySchema, value);
  }
}
