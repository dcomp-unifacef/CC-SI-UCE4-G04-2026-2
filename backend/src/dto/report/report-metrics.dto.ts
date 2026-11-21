import { z } from 'zod';
import { parseDto } from '../shared/zod';

export const reportMetricsSchema = z
  .object({
    metrics: z
      .array(
        z
          .object({
            key: z.string().trim().min(1).max(100),
            value: z.number().finite().optional(),
            valueText: z.string().trim().min(1).max(255).optional(),
            unit: z.string().trim().max(80).optional(),
            sourceLabel: z.string().trim().max(180).optional(),
          })
          .strict()
          .refine(
            (metric) =>
              metric.value !== undefined || metric.valueText !== undefined,
            'Each metric must include value or valueText',
          ),
      )
      .max(100),
  })
  .strict();

export type ReportMetricsInput = z.infer<typeof reportMetricsSchema>;

export class ReportMetricsDto {
  static parse(value: unknown): ReportMetricsInput {
    return parseDto(reportMetricsSchema, value);
  }
}
