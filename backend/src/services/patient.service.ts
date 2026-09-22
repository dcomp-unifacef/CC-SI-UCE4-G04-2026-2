import { CreatePatientDto } from '../dto/patient/create.patient.dto';
import { UpdatePatientDto } from '../dto/patient/update.patient.dto';
import { ConflictException } from '../errors/ConflictException';
import { NotFoundError } from '../errors/NotFoundError';
import { Patient } from '../generated/prisma/client';
import * as repository from '../repositories/patient.respository';

export async function findAll(): Promise<Patient[]> {
  return await repository.findAll();
}

export async function findById(id: string): Promise<Patient> {
  const patient = await repository.findById(id);

  if (!patient) throw new NotFoundError('Patient not exists');

  return patient;
}

export async function findByEmail(email: string): Promise<Patient> {
  const patient = await repository.findByEmail(email);

  if (!patient) throw new NotFoundError('Patient not exists');

  return patient;
}

export async function create(data: CreatePatientDto): Promise<Patient> {
  const exists = await repository.findByEmail(data.email as any);

  if (exists) throw new ConflictException('Patient already exists');

  return repository.create(data);
}

export async function update(id: string, data: UpdatePatientDto): Promise<Patient> {
  const exists = await repository.findById(id);

  if (!exists) throw new NotFoundError('Patient not exists');

  const patient = await repository.update(id, data);
  return patient;
}

export async function remove(id: string) {
  const patient = await repository.findById(id);

  if (!patient) throw new NotFoundError('Patient not exists');

  return repository.remove(id);
}
