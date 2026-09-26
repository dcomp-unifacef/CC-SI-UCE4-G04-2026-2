import { AppError } from '../errors/AppError';
import { prisma } from '../db/prisma';
import { PatientDevice } from '../generated/prisma/client';
import { CreatePatientDeviceDto } from '../dto/patient-device/create.patientDevice.dto';
import { UpdatePatientDeviceDto } from '../dto/patient-device/update.patientDevice.dto';
import { NotFoundError } from '../errors/NotFoundError';
import * as repository from '../repositories/patientDevice.repository';

export async function findAll() {
  return await repository.findAll();
}

export async function findById(id: string): Promise<PatientDevice> {
  const patientDevice = await repository.findById(id);

  if (!patientDevice) throw new NotFoundError('Patient-device not found');

  return patientDevice;
}

export async function create(data: CreatePatientDeviceDto): Promise<PatientDevice> {
  const patient = await prisma.patient.findUnique({
    where: { id: data.patientId },
  });

  if (!patient) throw new NotFoundError('Patient not found');

  const device = await prisma.device.findUnique({
    where: { id: data.deviceId },
  });

  if (!device) throw new NotFoundError('Device not found');

  return await repository.create(data);
}

export async function update(id: string, data: UpdatePatientDeviceDto): Promise<PatientDevice> {
  await findById(id);

  return await repository.update(id, data);
}

export async function remove(id: string): Promise<PatientDevice> {
  await findById(id);

  return await repository.remove(id);
}
