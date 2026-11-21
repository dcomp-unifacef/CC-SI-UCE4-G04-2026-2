import { z } from 'zod';
import {
  cpfSchema,
  dateOnlySchema,
  emailSchema,
  emptyToUndefined,
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

export const createPatientSchema = z
  .object({
    fullName: z.string().trim().min(1).max(180),
    phone: phoneSchema,
    birthDate: emptyToUndefined(dateOnlySchema),
    therapyStartDate: emptyToUndefined(dateOnlySchema),
    cpf: emptyToUndefined(cpfSchema),
    cep: emptyToUndefined(cepSchema),
    email: emptyToUndefined(emailSchema),
    cpapSerialNumber: emptyToUndefined(z.string().trim().min(1).max(120)),
    cpapModelId: emptyToUndefined(uuidSchema),
    cpapModelName: emptyToUndefined(z.string().trim().min(1).max(160)),
    filterType: emptyToUndefined(filterTypeSchema),
    physicianName: emptyToUndefined(z.string().trim().min(1).max(180)),
    maskModel: emptyToUndefined(z.string().trim().min(1).max(160)),
    reportPlatform: emptyToUndefined(reportPlatformSchema),
    status: z.enum(['ACTIVE', 'PAUSED', 'INACTIVE']).optional(),
    whatsappOptIn: z.boolean().optional(),
  })
  .strict();

export type CreatePatientInput = z.infer<typeof createPatientSchema>;

export class CreatePatientDto {
  static parse(value: unknown): CreatePatientInput {
    return parseDto(createPatientSchema, value);
  }
}
