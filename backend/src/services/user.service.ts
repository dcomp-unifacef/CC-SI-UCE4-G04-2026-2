import { CreateUserDto } from '../dto/user/create.user.dto';
import { UpdateUserDto } from '../dto/user/update.user.dto';
import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';
import { User } from '../generated/prisma/client';
import * as repository from '../repositories/user.respository';

export async function findAll(): Promise<User[]> {
  return await repository.findAll();
}

export async function findById(id: string): Promise<User> {
  const user = await repository.findById(id);

  if (!user) throw new NotFoundError('Patient not found');

  return user;
}

export async function findByEmail(email: string): Promise<User> {
  const user = await repository.findByEmail(email);

  if (!user) throw new NotFoundError('User not found');

  return user;
}

export async function create(data: CreateUserDto): Promise<User> {
  const exists = await repository.findByEmail(data.email as any);

  if (exists) throw new ConflictError('User already exists');

  return await repository.create(data);
}

export async function update(id: string, data: UpdateUserDto): Promise<User> {
  const exists = await repository.findById(id);

  if (!exists) throw new NotFoundError('User not found');

  return await repository.update(id, data);
}

export async function remove(id: string): Promise<User> {
  const user = await repository.findById(id);

  if (!user) throw new NotFoundError('User not found');

  return await repository.remove(id);
}
