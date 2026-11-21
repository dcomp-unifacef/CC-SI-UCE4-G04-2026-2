import { randomUUID } from 'node:crypto';
import { basename } from 'node:path';
import { raw, type NextFunction, type Request, type Response } from 'express';
import { BadRequestError } from '../errors/BadRequestError';

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_FILES = 20;

export const rawMultipartBody = raw({
  type: 'multipart/form-data',
  limit: `${MAX_FILE_BYTES * MAX_FILES + 2 * 1024 * 1024}b`,
});

function parseDisposition(header: string, key: string): string | undefined {
  const match = header.match(new RegExp(`${key}="([^"]*)"`, 'i'));
  return match?.[1];
}

export function multipartFiles(expectedField: string, maxFiles = 1) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const contentType = req.headers['content-type'] ?? '';
      const boundaryMatch = contentType.match(
        /boundary=(?:"([^"]+)"|([^;]+))/i,
      );
      const boundaryValue = boundaryMatch?.[1] ?? boundaryMatch?.[2]?.trim();
      if (!boundaryValue)
        throw new BadRequestError('Multipart boundary is missing', []);
      if (!Buffer.isBuffer(req.body))
        throw new BadRequestError(
          'Multipart request body could not be read',
          [],
        );

      const body = req.body as Buffer;
      const delimiter = Buffer.from(`--${boundaryValue}`);
      const files: NonNullable<Request['uploads']> = [];
      const fields: Record<string, string> = {};
      let cursor = 0;
      let totalFileBytes = 0;

      while (cursor < body.length) {
        const partStart = body.indexOf(delimiter, cursor);
        if (partStart < 0) break;
        cursor = partStart + delimiter.length;
        if (body[cursor] === 45 && body[cursor + 1] === 45) break;
        if (body[cursor] === 13 && body[cursor + 1] === 10) cursor += 2;

        const headersEnd = body.indexOf(Buffer.from('\r\n\r\n'), cursor);
        if (headersEnd < 0)
          throw new BadRequestError('Malformed multipart headers', []);
        const headerText = body.subarray(cursor, headersEnd).toString('latin1');
        const nextBoundary = body.indexOf(delimiter, headersEnd + 4);
        if (nextBoundary < 0)
          throw new BadRequestError('Malformed multipart body', []);
        const dataEnd =
          nextBoundary >= 2 &&
          body[nextBoundary - 2] === 13 &&
          body[nextBoundary - 1] === 10
            ? nextBoundary - 2
            : nextBoundary;
        const data = body.subarray(headersEnd + 4, dataEnd);
        const disposition =
          headerText
            .split('\r\n')
            .find((line) => /^content-disposition:/i.test(line)) ?? '';
        const fieldName = parseDisposition(disposition, 'name');
        if (!fieldName)
          throw new BadRequestError(
            'Multipart part is missing a field name',
            [],
          );
        const originalName = parseDisposition(disposition, 'filename');

        if (originalName !== undefined) {
          if (fieldName !== expectedField)
            throw new BadRequestError(
              `File field must be named "${expectedField}"`,
              [],
            );
          if (files.length >= maxFiles || files.length >= MAX_FILES)
            throw new BadRequestError(
              `At most ${maxFiles} PDF file(s) can be uploaded at once`,
              [],
            );
          if (data.length === 0 || data.length > MAX_FILE_BYTES)
            throw new BadRequestError(
              'Each PDF must be between 1 byte and 20 MB',
              [],
            );
          const contentTypeHeader = headerText
            .split('\r\n')
            .find((line) => /^content-type:/i.test(line));
          const mimeType =
            contentTypeHeader
              ?.split(':')
              .slice(1)
              .join(':')
              .trim()
              .toLowerCase() ?? 'application/octet-stream';
          if (
            mimeType !== 'application/pdf' &&
            mimeType !== 'application/octet-stream'
          ) {
            throw new BadRequestError('Only PDF documents are accepted', []);
          }
          if (data.subarray(0, 5).toString('ascii') !== '%PDF-')
            throw new BadRequestError(
              'The uploaded file is not a valid PDF',
              [],
            );
          const safeName =
            basename(originalName)
              .replace(/[\r\n\0]/g, '')
              .slice(0, 255) || `document-${randomUUID()}.pdf`;
          files.push({
            fieldName,
            originalName: safeName,
            mimeType: 'application/pdf',
            buffer: Buffer.from(data),
          });
          totalFileBytes += data.length;
        } else {
          if (data.length > 4096)
            throw new BadRequestError('Multipart form field is too large', []);
          fields[fieldName] = data.toString('utf8');
        }
        cursor = nextBoundary;
      }
      if (totalFileBytes > MAX_FILE_BYTES * maxFiles)
        throw new BadRequestError(
          'Multipart upload exceeds the total size limit',
          [],
        );
      if (files.length === 0)
        throw new BadRequestError('At least one PDF file is required', []);
      req.uploads = files;
      req.uploadFields = fields;
      next();
    } catch (error) {
      next(error);
    }
  };
}
