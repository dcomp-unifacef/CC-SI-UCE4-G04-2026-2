import { z } from 'zod';
import { paginationSchema, parseDto, queryBooleanSchema } from '../shared/zod';

export const userQuerySchema = z
  .object({
    ...paginationSchema,
    search: z.string().trim().max(180).optional(),
    role: z.enum(['ADMIN', 'STAFF']).optional(),
    isActive: queryBooleanSchema.optional(),
  })
  .strict();

export type UserQueryInput = z.infer<typeof userQuerySchema>;

export class UserQueryDto {
  static parse(value: unknown): UserQueryInput {
    return parseDto(userQuerySchema, value);
  }
}
