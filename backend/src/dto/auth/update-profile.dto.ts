import { z } from 'zod';
import { emailSchema, parseDto } from '../shared/zod';

export const updateProfileSchema = z
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
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    'At least one field must be provided',
  );

export class UpdateProfileDto {
  static parse(value: unknown) {
    return parseDto(updateProfileSchema, value);
  }
}
