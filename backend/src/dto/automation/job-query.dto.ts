import { z } from 'zod';
import { paginationSchema, parseDto, uuidSchema } from '../shared/zod';

export const jobQuerySchema = z
  .object({
    ...paginationSchema,
    status: z
      .enum(['QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED'])
      .optional(),
    type: z
      .enum([
        'MESSAGE_SEND',
        'REPORT_IMPORT',
        'REPORT_PROCESS',
        'REPORT_SEND',
        'PORTAL_SYNC',
      ])
      .optional(),
    patientId: uuidSchema.optional(),
  })
  .strict();

export type JobQueryInput = z.infer<typeof jobQuerySchema>;

export class JobQueryDto {
  static parse(value: unknown): JobQueryInput {
    return parseDto(jobQuerySchema, value);
  }
}
