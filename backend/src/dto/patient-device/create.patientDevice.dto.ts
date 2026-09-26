import { IsUUID, IsOptional, IsDateString, IsString } from "class-validator";

export class CreatePatientDeviceDto {
  @IsUUID()
  patientId!: string;

  @IsUUID()
  deviceId!: string;

  @IsOptional()
  @IsDateString()
  assignedAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}