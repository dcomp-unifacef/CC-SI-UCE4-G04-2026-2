import { z } from 'zod';
import { dateOnlySchema, emptyToUndefined, parseDto } from '../shared/zod';

export const reportImportSchema = z
  .object({
    platform: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z
        .enum(['AIRVIEW', 'CARE_ORCHESTRATOR', 'SMART_LIVE', 'MANUAL'])
        .default('MANUAL'),
    ),
    periodStart: emptyToUndefined(dateOnlySchema),
    periodEnd: emptyToUndefined(dateOnlySchema),
  })
  .strict()
  .refine(
    (value) =>
      !value.periodStart ||
      !value.periodEnd ||
      value.periodStart <= value.periodEnd,
    {
      path: ['periodEnd'],
      message: 'periodEnd must be on or after periodStart',
    },
  );

export type ReportImportInput = z.infer<typeof reportImportSchema>;

export class ReportImportDto {
  static parse(value: unknown) {
    return parseDto(reportImportSchema, value);
  }
}
