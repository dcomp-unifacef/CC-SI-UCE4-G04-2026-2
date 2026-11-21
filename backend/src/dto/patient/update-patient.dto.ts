import { z } from 'zod';
import {
  cpfSchema,
  dateOnlySchema,
  emailSchema,
  emptyToNull,
  parseDto,
  phoneSchema,
  uuidSchema,
} from '../shared/zod';

const cepSchema = z
  .string()
  .trim()
  .regex(/^\d{5}-?\d{3}$/)
  .transform((value) => value.replace(/^(\d{5})(\d{3})$/, '$1-$2'));
const filterTypeSchema = z.enum(['WASHABLE', 'DISPOSABLE', 'UNKNOWN']);
const reportPlatformSchema = z.enum([
  'AIRVIEW',
  'CARE_ORCHESTRATOR',
  'SMART_LIVE',
]);

export const updatePatientSchema = z
  .object({
    fullName: z.string().trim().min(1).max(180).optional(),
    phone: phoneSchema.optional(),
    birthDate: emptyToNull(dateOnlySchema),
    therapyStartDate: emptyToNull(dateOnlySchema),
    cpf: emptyToNull(cpfSchema),
    cep: emptyToNull(cepSchema),
    email: emptyToNull(emailSchema),
    cpapSerialNumber: emptyToNull(z.string().trim().min(1).max(120)),
    cpapModelId: emptyToNull(uuidSchema),
    cpapModelName: emptyToNull(z.string().trim().min(1).max(160)),
    filterType: emptyToNull(filterTypeSchema),
    physicianName: emptyToNull(z.string().trim().min(1).max(180)),
    maskModel: emptyToNull(z.string().trim().min(1).max(160)),
    reportPlatform: emptyToNull(reportPlatformSchema),
    status: z.enum(['ACTIVE', 'PAUSED', 'INACTIVE']).optional(),
    whatsappOptIn: z.boolean().optional(),
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    'At least one field must be provided',
  );

export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;

export class UpdatePatientDto {
  static parse(value: unknown): UpdatePatientInput {
    return parseDto(updatePatientSchema, value);
  }
}
