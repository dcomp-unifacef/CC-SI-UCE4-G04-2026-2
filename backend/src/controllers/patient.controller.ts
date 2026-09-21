import type {
  Request,
  Response,
  NextFunction,
} from "express";

import * as repository from "../repositories/patient.respository.ts";

import type { CreatePatientDto } from "../dto/patient/create.patient.dto.ts";
import type { UpdatePatientDto } from "../dto/patient/update.patient.dto.ts";

type PatientIdParams = {
  id: string;
};

type CreatePatientRequest = Request<
  Record<string, never>,
  unknown,
  CreatePatientDto
>;

type UpdatePatientRequest = Request<
  PatientIdParams,
  unknown,
  UpdatePatientDto
>;

export async function retrieveAll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const patients = await repository.findAll();

    res.json(patients);
  }
  catch (error) {
    next(error);
  }
}

export async function retrieveOne(
  req: Request<PatientIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id;

    const patient = await repository.findById(id);

    res.json(patient);
  }
  catch (error) {
    next(error);
  }
}

export async function create(
  req: CreatePatientRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const patient = await repository.create(req.body);

    res.status(201).json(patient);
  }
  catch (error) {
    next(error);
  }
}

export async function update(
  req: UpdatePatientRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id;

    const patient = await repository.update(
      id,
      req.body
    );

    res.json(patient);
  }
  catch (error) {
    next(error);
  }
}

export async function remove(
  req: Request<PatientIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id;

    await repository.remove(id);

    res.status(204).end();
  }
  catch (error) {
    next(error);
  }
}