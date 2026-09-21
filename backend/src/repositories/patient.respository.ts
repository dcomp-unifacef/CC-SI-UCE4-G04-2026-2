import { prisma } from "../server/prisma";

import type { CreatePatientDto } from "../dto/patient/create.patient.dto.ts";

import type { UpdatePatientDto } from "../dto/patient/update.patient.dto.ts";

export function findAll() {
  return prisma.patient.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export function findById(id: string) {
  return prisma.patient.findUnique({
    where: { id },
  });
}

export function create(data: CreatePatientDto) {
  return prisma.patient.create({
    data: {
      ...data,
    },
  });
}

export function update(id: string, data: UpdatePatientDto) {
  return prisma.patient.update({
    where: { id },
    data: {
      ...data,
    },
  });
}

export function remove(id: string) {
  return prisma.patient.delete({
    where: { id },
  });
}