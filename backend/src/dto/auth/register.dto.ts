import { z } from 'zod';
import { emailSchema, emptyToUndefined, parseDto } from '../shared/zod';

export const registerSchema = z
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
    confirmPassword: z.string().optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (
      value.confirmPassword !== undefined &&
      value.confirmPassword !== value.password
    ) {
      context.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  })
  .transform(({ confirmPassword: _confirmPassword, ...value }) => value);

export type RegisterInput = z.infer<typeof registerSchema>;

export class RegisterDto {
  static parse(value: unknown): RegisterInput {
    return parseDto(registerSchema, value);
  }
}
