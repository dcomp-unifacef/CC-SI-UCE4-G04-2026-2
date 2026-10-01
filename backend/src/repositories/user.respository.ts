import { prisma } from '../db/prisma';
import type { CreateUserDto } from '../dto/user/create.user.dto';
import type { UpdateUserDto } from '../dto/user/update.user.dto';

export async function findAll() {
  return await prisma.user.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

export async function findById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
  });
}

export async function findByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function create(data: CreateUserDto) {
  return await prisma.user.create({
    data,
  });
}

export async function update(id: string, data: UpdateUserDto) {
  return await prisma.user.update({
    where: { id },
    data,
  });
}

export async function remove(id: string) {
  return await prisma.user.delete({
    where: { id },
  });
}
