import { z } from 'zod';
import {
  dateOnlySchema,
  paginationSchema,
  parseDto,
  uuidSchema,
} from '../shared/zod';

export const messageQuerySchema = z
  .object({
    ...paginationSchema,
    status: z
      .enum([
        'SCHEDULED',
        'PENDING',
        'PROCESSING',
        'SENT',
        'DELIVERED',
        'FAILED',
        'CANCELLED',
      ])
      .optional(),
    category: z
      .enum([
        'FILTER_WASH',
        'FILTER_REPLACE_DISPOSABLE',
        'FILTER_REPLACE_WASHABLE',
        'ANNUAL_MAINTENANCE',
        'MONTHLY_REPORT',
        'CUSTOM',
      ])
      .optional(),
    patientId: uuidSchema.optional(),
    from: dateOnlySchema.optional(),
    to: dateOnlySchema.optional(),
  })
  .strict();

export type MessageQueryInput = z.infer<typeof messageQuerySchema>;

export class MessageQueryDto {
  static parse(value: unknown): MessageQueryInput {
    return parseDto(messageQuerySchema, value);
  }
}
