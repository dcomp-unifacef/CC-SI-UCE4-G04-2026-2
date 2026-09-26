import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { DeviceStatus } from '../../generated/prisma/enums';

export class UpdateDeviceDto {
  @IsOptional()
  @IsString({ message: 'Serial Number must be a valid string' })
  serialNumber!: string;

  @IsOptional()
  @IsString({ message: 'Manufacturer must be a valid string' })
  manufacturer?: string;

  @IsOptional()
  @IsString({ message: 'Model must be a valid string' })
  model?: string;

  @IsOptional()
  @IsEnum(DeviceStatus, {
    message: `Status must be one of the following values: ${Object.values(DeviceStatus).join(', ')}`,
  })
  status?: DeviceStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate({
    message: 'Acquisition Date must be a valid date format (YYYY-MM-DD)',
  })
  acquisitionDate?: Date;

  @IsOptional()
  @IsString({ message: 'Notes must be a valid string' })
  notes?: string;
}
