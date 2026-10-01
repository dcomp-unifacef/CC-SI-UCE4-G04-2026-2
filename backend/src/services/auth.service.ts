import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterDto } from '../dto/auth/register.dto';
import { ConflictError } from '../errors/ConflictError';
import { User } from '../generated/prisma/client';
import { authConfig } from '../config/auth.config';
import * as reposiroty from '../repositories/user.respository';
import { LoginDto } from '../dto/auth/login.dto';
import { UnauthorizedError } from '../errors/UnauthorizedError';

interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export async function register(data: RegisterDto): Promise<AuthResponse> {
  const exists = await reposiroty.findByEmail(data.email);

  if (exists) throw new ConflictError('User already exists');

  const hash = await bcrypt.hash(data.password, 10);

  const user = await reposiroty.create({
    ...data,
    password: hash,
  });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    authConfig.jwt.secret as string,
    { expiresIn: authConfig.jwt.expiresIn } as jwt.SignOptions,
  );

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
}


export async function login(data: LoginDto): Promise<AuthResponse> {
  const user = await reposiroty.findByEmail(data.email);

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password as string);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    authConfig.jwt.secret as string,
    { expiresIn: authConfig.jwt.expiresIn } as jwt.SignOptions,
  );

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
}
