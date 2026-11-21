import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { NotFoundError } from '../errors/NotFoundError';

const privateRoot = resolve(
  process.env.PRIVATE_FILES_DIR ?? join(process.cwd(), 'storage', 'private'),
);

export function checksum(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

export async function savePrivatePdf(
  buffer: Buffer,
): Promise<{ storageKey: string; sha256: string }> {
  if (
    buffer.length < 5 ||
    buffer.subarray(0, 5).toString('ascii') !== '%PDF-'
  ) {
    throw new Error('Only valid PDF documents can be stored');
  }
  await mkdir(privateRoot, { recursive: true, mode: 0o700 });
  const storageKey = `${randomUUID()}.pdf`;
  await writeFile(join(privateRoot, storageKey), buffer, {
    flag: 'wx',
    mode: 0o600,
  });
  return { storageKey, sha256: checksum(buffer) };
}

function storagePath(storageKey: string): string {
  const safeKey = basename(storageKey);
  if (safeKey !== storageKey || !/^[0-9a-f-]{36}\.pdf$/i.test(safeKey))
    throw new NotFoundError('File not found');
  const path = resolve(privateRoot, safeKey);
  if (!path.startsWith(`${privateRoot}/`))
    throw new NotFoundError('File not found');
  return path;
}

export async function readPrivatePdf(storageKey: string): Promise<Buffer> {
  try {
    return await readFile(storagePath(storageKey));
  } catch {
    throw new NotFoundError('File not found');
  }
}

export async function removePrivatePdf(storageKey: string): Promise<void> {
  try {
    await unlink(storagePath(storageKey));
  } catch {}
}
