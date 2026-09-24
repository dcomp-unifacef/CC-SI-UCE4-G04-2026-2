import { CreateDeviceDto } from '../dto/device/create.device.dto';
import { UpdateDeviceDto } from '../dto/device/update.device.dto';
import { ConflictException } from '../errors/ConflictException';
import { NotFoundError } from '../errors/NotFoundError';
import { Device } from '../generated/prisma/client';
import * as repository from '../repositories/device.respository';

export async function findAll(): Promise<Device[]> {
  return await repository.findAll();
}

export async function findById(id: string): Promise<Device> {
  const device = await repository.findById(id);

  if (!device) throw new NotFoundError('Device not exists');

  return device;
}


export async function create(data: CreateDeviceDto): Promise<Device> {
  const exists = await repository.findBySerialNumber(data.serialNumber);

  if (exists) throw new ConflictException('Device already exists');

  return repository.create(data);
}

export async function update(id: string, data: UpdateDeviceDto): Promise<Device> {
  const exists = await repository.findById(id);

  if (!exists) throw new NotFoundError('Device not exists');

  const device = await repository.update(id, data);
  return device;
}

export async function remove(id: string) {
  const device = await repository.findById(id);

  if (!device) throw new NotFoundError('Device not exists');

  return repository.remove(id);
}
