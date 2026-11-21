import { z } from 'zod';
import { emailSchema, parseDto } from '../shared/zod';

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    email: emailSchema.optional(),
    username: z
      .string()
      .trim()
      .min(3)
      .max(60)
      .regex(/^[a-z0-9._-]+$/i)
      .transform((value) => value.toLowerCase())
      .nullable()
      .optional(),
    role: z.enum(['ADMIN', 'STAFF']).optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    'At least one field must be provided',
  );

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export class UpdateUserDto {
  static parse(value: unknown): UpdateUserInput {
    return parseDto(updateUserSchema, value);
  }
}
