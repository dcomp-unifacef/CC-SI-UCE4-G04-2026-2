import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { UserRole, UserStatus } from '../../generated/prisma/enums';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is a required field' })
  @IsOptional()
  name?: string;

  @IsEmail({}, { message: 'Email must be a valid mail' })
  @IsNotEmpty({ message: 'Mail is a required field' })
  @IsOptional()
  email?: string;

  @IsUrl({}, { message: 'Photo must be valid' })
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsOptional()
  password?: string;

  @IsEnum(UserRole, {
    message: `Status must be one of the following values: ${Object.values(UserRole).join(', ')}`,
  })
  @IsOptional()
  role?: UserRole;

  @IsEnum(UserStatus, {
    message: `Status must be one of the following values: ${Object.values(UserStatus).join(', ')}`,
  })
  @IsOptional()
  status?: UserStatus;
}