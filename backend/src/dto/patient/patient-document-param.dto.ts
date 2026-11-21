import { z } from 'zod';
import { parseDto, uuidSchema } from '../shared/zod';

export const patientDocumentParamSchema = z
  .object({ patientId: uuidSchema, documentId: uuidSchema })
  .strict();

export class PatientDocumentParamDto {
  static parse(value: unknown) {
    return parseDto(patientDocumentParamSchema, value);
  }
}
