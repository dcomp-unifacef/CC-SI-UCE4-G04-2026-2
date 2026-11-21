import { z } from 'zod';
import { emailSchema, emptyToUndefined, parseDto } from '../shared/zod';

export const createUserSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: emailSchema,
    username: emptyToUndefined(
      z
        .string()
        .trim()
        .min(3)
        .max(60)
        .regex(/^[a-z0-9._-]+$/i)
        .transform((value) => value.toLowerCase()),
    ),
    password: z
      .string()
      .min(12)
      .max(128)
      .regex(/[A-Za-z]/, 'Password must contain a letter')
      .regex(/\d/, 'Password must contain a number'),
    role: z.enum(['ADMIN', 'STAFF']).default('STAFF'),
  })
  .strict();

export type CreateUserInput = z.infer<typeof createUserSchema>;

export class CreateUserDto {
  static parse(value: unknown): CreateUserInput {
    return parseDto(createUserSchema, value);
  }
}
