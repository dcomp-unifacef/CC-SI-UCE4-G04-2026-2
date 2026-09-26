import { IsOptional, IsDateString, IsString } from "class-validator";

export class UpdatePatientDeviceDto {
  @IsOptional()
  @IsDateString()
  unassignedAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}