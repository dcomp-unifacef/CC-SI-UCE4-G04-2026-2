import { z } from 'zod';
import { emptyToNull, parseDto } from '../shared/zod';

export const updateTemplateSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .transform((value) => value.toLowerCase().replace(/\s+/g, '-'))
      .optional(),
    name: z.string().trim().min(1).max(180).optional(),
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
    filterType: z
      .enum(['WASHABLE', 'DISPOSABLE', 'UNKNOWN'])
      .nullable()
      .optional(),
    body: z.string().trim().min(1).max(10000).optional(),
    mediaUrl: emptyToNull(z.string().trim().url().max(2000)),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    'At least one field must be provided',
  );

export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;

export class UpdateTemplateDto {
  static parse(value: unknown): UpdateTemplateInput {
    return parseDto(updateTemplateSchema, value);
  }
}
