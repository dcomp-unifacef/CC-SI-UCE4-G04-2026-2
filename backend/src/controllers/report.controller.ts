import { type NextFunction, type Request, type Response } from 'express';
import { ReportImportDto } from '../dto/report/report-import.dto';
import * as service from '../services/report.service';
import { getRouteParam } from '../middlewares/validator.middleware';

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json(await service.list(req.query as never));
  } catch (error) {
    next(error);
  }
}

export async function importFiles(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth || !req.uploads) throw new Error('Upload context is missing');
    const fields = req.uploadFields ?? {};
    const input = ReportImportDto.parse(fields);
    res
      .status(201)
      .json(await service.importFiles(req.uploads, input, req.auth.userId));
  } catch (error) {
    next(error);
  }
}

export async function get(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json({ report: await service.findById(getRouteParam(req, 'id')) });
  } catch (error) {
    next(error);
  }
}

export async function associate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) throw new Error('Authentication context is missing');
    res.json({
      report: await service.associate(
        getRouteParam(req, 'id'),
        req.body.patientId,
        req.auth.userId,
      ),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMetrics(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) throw new Error('Authentication context is missing');
    res.json({
      metrics: await service.updateMetrics(
        getRouteParam(req, 'id'),
        req.body,
        req.auth.userId,
      ),
    });
  } catch (error) {
    next(error);
  }
}

export async function approve(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) throw new Error('Authentication context is missing');
    res.json({
      report: await service.approve(getRouteParam(req, 'id'), req.auth.userId),
    });
  } catch (error) {
    next(error);
  }
}

export async function retry(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) throw new Error('Authentication context is missing');
    res
      .status(202)
      .json(await service.retry(getRouteParam(req, 'id'), req.auth.userId));
  } catch (error) {
    next(error);
  }
}

export async function file(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await service.readFile(getRouteParam(req, 'id'));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename*=UTF-8''${encodeURIComponent(result.report.originalName)}`,
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(result.buffer);
  } catch (error) {
    next(error);
  }
}
