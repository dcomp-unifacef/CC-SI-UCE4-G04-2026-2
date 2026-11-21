import { z } from 'zod';
import { parseDto } from '../shared/zod';

export const updatePortalSettingSchema = z
  .object({ isEnabled: z.boolean() })
  .strict();

export class UpdatePortalSettingDto {
  static parse(value: unknown) {
    return parseDto(updatePortalSettingSchema, value);
  }
}
