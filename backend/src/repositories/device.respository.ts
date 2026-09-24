import { prisma } from '../db/prisma';
import { CreateDeviceDto } from '../dto/device/create.device.dto';
import { UpdateDeviceDto } from '../dto/device/update.device.dto';

export async function findAll() {
  return await prisma.device.findMany({
    orderBy: {
      id: 'asc',
    },
  });
}

export async function findById(id: string) {
  return await prisma.device.findUnique({
    where: { id },
  });
}

export async function findBySerialNumber(serialNumber: string) {
  return await prisma.device.findUnique({
    where: { serialNumber },
  });
}

export async function create(data: CreateDeviceDto) {
  return await prisma.device.create({
    data,
  });
}

export async function update(id: string, data: UpdateDeviceDto) {
  return await prisma.device.update({
    where: { id },
    data: {
      ...data,
      acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate) : undefined as any,
    },
  });
}

export async function remove(id: string) {
  return await prisma.device.delete({
    where: { id },
  });
}
