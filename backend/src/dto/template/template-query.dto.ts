import { z } from 'zod';
import { paginationSchema, parseDto, queryBooleanSchema } from '../shared/zod';

export const templateQuerySchema = z
  .object({
    ...paginationSchema,
    search: z.string().trim().max(180).optional(),
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
    filterType: z.enum(['WASHABLE', 'DISPOSABLE', 'UNKNOWN']).optional(),
    isActive: queryBooleanSchema.optional(),
  })
  .strict();

export type TemplateQueryInput = z.infer<typeof templateQuerySchema>;

export class TemplateQueryDto {
  static parse(value: unknown): TemplateQueryInput {
    return parseDto(templateQuerySchema, value);
  }
}
