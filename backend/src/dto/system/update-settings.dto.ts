import { z } from 'zod';
import { parseDto } from '../shared/zod';

const settingTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const updateSettingsSchema = z
  .object({
    timezone: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .refine((timezone) => {
        try {
          new Intl.DateTimeFormat('en-US', { timeZone: timezone });
          return true;
        } catch {
          return false;
        }
      }, 'timezone must be a valid IANA timezone')
      .optional(),
    sendingWindowStart: settingTime.optional(),
    sendingWindowEnd: settingTime.optional(),
    messageAutomationEnabled: z.boolean().optional(),
    reportAutomationEnabled: z.boolean().optional(),
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    'At least one setting must be provided',
  );

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

export class UpdateSettingsDto {
  static parse(value: unknown): UpdateSettingsInput {
    return parseDto(updateSettingsSchema, value);
  }
}
