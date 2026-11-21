import { z } from 'zod';
import { parseDto, uuidSchema } from '../shared/zod';

const scheduledAtSchema = z.iso
  .datetime()
  .transform((value) => new Date(value));

export const createMessageSchema = z
  .object({
    patientId: uuidSchema,
    category: z
      .enum([
        'FILTER_WASH',
        'FILTER_REPLACE_DISPOSABLE',
        'FILTER_REPLACE_WASHABLE',
        'ANNUAL_MAINTENANCE',
        'MONTHLY_REPORT',
        'CUSTOM',
      ])
      .default('CUSTOM'),
    templateId: uuidSchema.optional(),
    reportId: uuidSchema.optional(),
    content: z.string().trim().min(1).max(10000),
    scheduledAt: scheduledAtSchema.optional(),
  })
  .strict();

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

export class CreateMessageDto {
  static parse(value: unknown): CreateMessageInput {
    return parseDto(createMessageSchema, value);
  }
}
