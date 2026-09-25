import { IsUUID } from 'class-validator';

export class IdParamDto {
  @IsUUID('4', { message: 'The id parameter must be a valid UUID v4.' })
  id!: string;
}