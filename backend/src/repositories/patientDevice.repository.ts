import { prisma } from '../db/prisma';
import type { CreatePatientDeviceDto } from '../dto/patient-device/create.patientDevice.dto';
import type { UpdatePatientDeviceDto } from '../dto/patient-device/update.patientDevice.dto';

export async function findAll() {
  return await prisma.patientDevice.findMany({
    include: {
      patient: true,
      Device: true,
    },
    orderBy: {
      assignedAt: 'desc',
    },
  });
}

export async function findById(id: string) {
  return await prisma.patientDevice.findUnique({
    where: { id },
    include: {
      patient: true,
      Device: true,
    },
  });
}

export async function create(data: CreatePatientDeviceDto) {
  return await prisma.patientDevice.create({
    data,
  });
}

export async function update(id: string, data: UpdatePatientDeviceDto) {
  return await prisma.patientDevice.update({
    where: { id },
    data,
  });
}

export async function remove(id: string) {
  return await prisma.patientDevice.delete({
    where: { id },
  });
}
