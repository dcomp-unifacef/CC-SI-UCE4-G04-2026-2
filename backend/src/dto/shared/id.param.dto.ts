import { z } from 'zod';
import { parseDto, uuidSchema } from './zod';

export const idParamSchema = z.object({ id: uuidSchema }).strict();

export class IdParamDto {
  static parse(value: unknown) {
    return parseDto(idParamSchema, value);
  }
}
