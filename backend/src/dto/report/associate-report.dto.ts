import { z } from 'zod';
import { parseDto, uuidSchema } from '../shared/zod';

export const associateReportSchema = z
  .object({ patientId: uuidSchema })
  .strict();

export class AssociateReportDto {
  static parse(value: unknown) {
    return parseDto(associateReportSchema, value);
  }
}
