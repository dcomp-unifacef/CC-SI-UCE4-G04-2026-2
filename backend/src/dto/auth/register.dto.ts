import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'Name must be a valid string' })
  @IsNotEmpty({ message: 'Name is a required field' })
  name!: string;
  
  @IsEmail({}, { message: 'The provided email is not valid' })
  @IsString({ message: 'Email must be a valid string' })
  @IsNotEmpty({ message: 'Email is a required field' })
  email!: string;

  @IsString({ message: 'Password must be a valid string' })
  @IsNotEmpty({ message: 'Password is a required field' })
  password!: string;
}
