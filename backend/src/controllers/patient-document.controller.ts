import { type NextFunction, type Request, type Response } from 'express';
import { UploadDocumentDto } from '../dto/patient/upload-document.dto';
import * as service from '../services/patient-document.service';
import { getRouteParam } from '../middlewares/validator.middleware';

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json({ documents: await service.list(getRouteParam(req, 'id')) });
  } catch (error) {
    next(error);
  }
}

export async function upload(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth || !req.uploads?.[0])
      throw new Error('Upload context is missing');
    const { type } = UploadDocumentDto.parse(req.uploadFields ?? {});
    res
      .status(201)
      .json({
        document: await service.upload(
          getRouteParam(req, 'id'),
          type,
          req.uploads[0],
          req.auth.userId,
        ),
      });
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
    const result = await service.download(
      getRouteParam(req, 'patientId'),
      getRouteParam(req, 'documentId'),
    );
    res.setHeader('Content-Type', result.document.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename*=UTF-8''${encodeURIComponent(result.document.originalName)}`,
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(result.buffer);
  } catch (error) {
    next(error);
  }
}
