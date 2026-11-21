import { z } from 'zod';
import { emptyToNull, parseDto } from '../shared/zod';

export const createTemplateSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .transform((value) => value.toLowerCase().replace(/\s+/g, '-')),
    name: z.string().trim().min(1).max(180),
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
    filterType: z
      .enum(['WASHABLE', 'DISPOSABLE', 'UNKNOWN'])
      .nullable()
      .optional(),
    body: z.string().trim().min(1).max(10000),
    mediaUrl: emptyToNull(z.string().trim().url().max(2000)),
    isActive: z.boolean().default(true),
  })
  .strict();

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;

export class CreateTemplateDto {
  static parse(value: unknown): CreateTemplateInput {
    return parseDto(createTemplateSchema, value);
  }
}
