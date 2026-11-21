import { z } from 'zod';
import { parseDto } from '../shared/zod';

export const updateCpapModelSchema = z
  .object({
    manufacturer: z.string().trim().min(1).max(120).optional(),
    model: z.string().trim().min(1).max(160).optional(),
    filterType: z.enum(['WASHABLE', 'DISPOSABLE', 'UNKNOWN']).optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    'At least one field must be provided',
  );

export type UpdateCpapModelInput = z.infer<typeof updateCpapModelSchema>;

export class UpdateCpapModelDto {
  static parse(value: unknown): UpdateCpapModelInput {
    return parseDto(updateCpapModelSchema, value);
  }
}
