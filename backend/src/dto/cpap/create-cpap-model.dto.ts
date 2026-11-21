import { z } from 'zod';
import { parseDto } from '../shared/zod';

export const createCpapModelSchema = z
  .object({
    manufacturer: z.string().trim().min(1).max(120),
    model: z.string().trim().min(1).max(160),
    filterType: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.enum(['WASHABLE', 'DISPOSABLE', 'UNKNOWN']).default('UNKNOWN'),
    ),
    isActive: z.boolean().default(true),
  })
  .strict();

export type CreateCpapModelInput = z.infer<typeof createCpapModelSchema>;

export class CreateCpapModelDto {
  static parse(value: unknown): CreateCpapModelInput {
    return parseDto(createCpapModelSchema, value);
  }
}
