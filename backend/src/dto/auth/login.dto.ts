import { z } from 'zod';
import { parseDto } from '../shared/zod';

export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1)
      .max(320)
      .transform((value) => value.toLowerCase()),
    password: z.string().min(1).max(128),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;

export class LoginDto {
  static parse(value: unknown): LoginInput {
    return parseDto(loginSchema, value);
  }
}
