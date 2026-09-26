import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdatePatientDto {
  @IsOptional()
  @IsString({ message: 'Name must be a valid string' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'CPF must be a valid string' })
  cpf?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Birth date must be a valid date format (YYYY-MM-DD)' })
  birthDate?: Date;

  @IsOptional()
  @IsString({ message: 'Phone must be a valid string' })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'The provided email is not valid' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Adress must be a valid string' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'City must be a valid string' })
  city?: string;

  @IsOptional()
  @IsString({ message: 'State must be a valid string' })
  state?: string;

  @IsOptional()
  @IsString({ message: 'Notes must be a valid string' })
  notes?: string;
}
