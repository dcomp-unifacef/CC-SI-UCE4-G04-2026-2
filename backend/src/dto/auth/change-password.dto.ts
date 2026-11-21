import { z } from 'zod';
import { parseDto } from '../shared/zod';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z
      .string()
      .min(12)
      .max(128)
      .regex(/[A-Za-z]/)
      .regex(/\d/),
  })
  .strict();

export class ChangePasswordDto {
  static parse(value: unknown) {
    return parseDto(changePasswordSchema, value);
  }
}
