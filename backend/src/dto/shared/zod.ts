import { z } from 'zod';
import { BadRequestError } from '../../errors/BadRequestError';

export function parseDto<T>(schema: z.ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (parsed.success) return parsed.data;
  throw new BadRequestError(
    'Request validation failed',
    parsed.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'body',
      rule: [issue.message],
    })),
  );
}

export const objectSchema = z.object({}).passthrough();

export const dateOnlySchema = z.iso
  .date()
  .transform((value) => new Date(`${value}T00:00:00.000Z`));

export function validCpf(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11 || /^([0-9])\1{10}$/.test(digits)) return false;
  const calculate = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1)
      sum += Number(digits[index]) * (length + 1 - index);
    const result = (sum * 10) % 11;
    return result === 10 ? 0 : result;
  };
  return (
    calculate(9) === Number(digits[9]) && calculate(10) === Number(digits[10])
  );
}

export const cpfSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/\D/g, ''))
  .refine(validCpf, 'CPF must be valid');

export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => {
    const hasPlus = value.startsWith('+');
    const digits = value.replace(/\D/g, '');
    return `${hasPlus ? '+' : ''}${digits}`;
  })
  .refine(
    (value) =>
      value.replace(/\D/g, '').length >= 8 &&
      value.replace(/\D/g, '').length <= 15,
    'Phone must contain 8 to 15 digits',
  );

export const emailSchema = z
  .string()
  .trim()
  .email()
  .max(320)
  .transform((value) => value.toLowerCase());

export const uuidSchema = z.uuid();

export const queryBooleanSchema = z.preprocess((value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}, z.boolean());

export const paginationSchema = {
  page: z.coerce.number().int().min(1).max(1_000_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
};

export function emptyToUndefined<T extends z.ZodType>(schema: T) {
  return z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    schema.optional(),
  );
}

export function emptyToNull<T extends z.ZodType>(schema: T) {
  return z.preprocess(
    (value) => (value === '' ? null : value),
    schema.nullable().optional(),
  );
}
