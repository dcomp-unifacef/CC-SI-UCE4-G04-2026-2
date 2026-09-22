import { prisma } from '../db/prisma';
import type { CreatePatientDto } from '../dto/patient/create.patient.dto.ts';
import type { UpdatePatientDto } from '../dto/patient/update.patient.dto.ts';

export async function findAll() {
  return await prisma.patient.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

export async function findById(id: string) {
  return await prisma.patient.findUnique({
    where: { id },
  });
}

export async function findByEmail(email: string) {
  return await prisma.patient.findUnique({
    where: { email },
  });
}

export async function create(data: CreatePatientDto) {
  return await prisma.patient.create({
    data: {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
    },
  });
}

export async function update(id: string, data: UpdatePatientDto) {
  return await prisma.patient.update({
    where: { id },
    data: {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined as any,
    },
  });
}

export async function remove(id: string) {
  return await prisma.patient.delete({
    where: { id },
  });
}
