import { z } from 'zod';
import { parseDto } from '../shared/zod';

export const uploadDocumentSchema = z
  .object({
    type: z.enum(['POLYSOMNOGRAPHY', 'OTHER']).default('POLYSOMNOGRAPHY'),
  })
  .strict();

export class UploadDocumentDto {
  static parse(value: unknown) {
    return parseDto(uploadDocumentSchema, value);
  }
}
