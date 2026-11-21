import { z } from 'zod';
import { paginationSchema, parseDto, queryBooleanSchema } from '../shared/zod';

export const cpapModelQuerySchema = z
  .object({
    ...paginationSchema,
    search: z.string().trim().max(160).optional(),
    filterType: z.enum(['WASHABLE', 'DISPOSABLE', 'UNKNOWN']).optional(),
    isActive: queryBooleanSchema.optional(),
  })
  .strict();

export type CpapModelQueryInput = z.infer<typeof cpapModelQuerySchema>;

export class CpapModelQueryDto {
  static parse(value: unknown): CpapModelQueryInput {
    return parseDto(cpapModelQuerySchema, value);
  }
}
