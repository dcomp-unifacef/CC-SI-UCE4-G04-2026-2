import { z } from 'zod';
import { parseDto, phoneSchema } from '../shared/zod';

export const evolutionTestMessageSchema = z
  .object({
    recipient: phoneSchema,
    message: z.string().trim().min(1).max(500),
  })
  .strict();

export class EvolutionTestMessageDto {
  static parse(value: unknown) {
    return parseDto(evolutionTestMessageSchema, value);
  }
}
