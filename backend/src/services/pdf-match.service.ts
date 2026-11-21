import { inflateRawSync, inflateSync } from 'node:zlib';
import { prisma } from '../db/prisma';

function decodePdfLiteral(value: string): string {
  return value
    .replace(
      /\\([nrtbf()\\])/g,
      (_match, char: string) =>
        ({
          n: '\n',
          r: '\r',
          t: '\t',
          b: '\b',
          f: '\f',
          '(': '(',
          ')': ')',
          '\\': '\\',
        })[char] ?? char,
    )
    .replace(/\\([0-7]{1,3})/g, (_match, octal: string) =>
      String.fromCharCode(parseInt(octal, 8)),
    )
    .replace(/\\\r?\n/g, '');
}

function extractStrings(source: string): string[] {
  const found: string[] = [];
  for (const match of source.matchAll(/\(((?:\\.|[^\\)])*)\)/g))
    found.push(decodePdfLiteral(match[1] ?? ''));
  for (const match of source.matchAll(/<([0-9a-fA-F]{4,})>/g)) {
    const hex = match[1] ?? '';
    if (hex.length % 2 !== 0) continue;
    const bytes = Buffer.from(hex, 'hex');
    if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
      const units: number[] = [];
      for (let i = 2; i + 1 < bytes.length; i += 2)
        units.push(bytes.readUInt16BE(i));
      found.push(String.fromCharCode(...units));
    } else found.push(bytes.toString('latin1'));
  }
  return found;
}

export function extractPdfSearchText(buffer: Buffer): string {
  const raw = buffer.toString('latin1');
  const sources = [raw];
  const streamPattern = /stream\r?\n/g;
  let match: RegExpExecArray | null;
  while ((match = streamPattern.exec(raw))) {
    const start = match.index + match[0].length;
    const end = raw.indexOf('endstream', start);
    if (end < 0) break;
    const header = raw.slice(Math.max(0, match.index - 512), match.index);
    if (/\/FlateDecode/.test(header)) {
      let dataEnd = end;
      while (
        dataEnd > start &&
        (raw[dataEnd - 1] === '\n' || raw[dataEnd - 1] === '\r')
      )
        dataEnd -= 1;
      const compressed = buffer.subarray(start, dataEnd);
      try {
        sources.push(inflateSync(compressed).toString('latin1'));
      } catch {
        try {
          sources.push(inflateRawSync(compressed).toString('latin1'));
        } catch {}
      }
    }
    streamPattern.lastIndex = end + 'endstream'.length;
  }
  return sources.flatMap(extractStrings).join(' ').toUpperCase();
}

const compactDigits = (value: string) => value.replace(/\D/g, '');
const compactSerial = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, '');

function containsCpf(text: string, cpf: string): boolean {
  const candidates =
    text.match(/(?<!\d)\d{3}(?:[ .\/-]?\d{3}){2}[ .\/-]?\d{2}(?!\d)/g) ?? [];
  return candidates.some((candidate) => compactDigits(candidate) === cpf);
}

function containsSerial(text: string, serial: string): boolean {
  const characters = compactSerial(serial).split('');
  if (characters.length < 6) return false;
  const pattern = characters
    .map((character) => character.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('[\\s._/-]*');
  return new RegExp(`(?<![A-Z0-9])${pattern}(?![A-Z0-9])`, 'i').test(text);
}

export async function findPatientMatch(buffer: Buffer): Promise<{
  patientId?: string;
  matchStatus: 'MATCHED' | 'REVIEW_REQUIRED' | 'UNMATCHED';
  identifier?: 'CPF' | 'CPAP_SERIAL';
}> {
  const text = extractPdfSearchText(buffer);
  const patients = await prisma.patient.findMany({
    select: { id: true, cpf: true, cpapSerialNumber: true },
  });
  const matches = new Map<string, 'CPF' | 'CPAP_SERIAL'>();

  for (const patient of patients) {
    if (patient.cpf) {
      const cpf = compactDigits(patient.cpf);
      if (cpf.length === 11 && containsCpf(text, cpf))
        matches.set(patient.id, 'CPF');
    }
    if (patient.cpapSerialNumber) {
      const serial = compactSerial(patient.cpapSerialNumber);
      if (serial.length >= 6 && containsSerial(text, serial))
        matches.set(patient.id, matches.get(patient.id) ?? 'CPAP_SERIAL');
    }
  }

  if (matches.size === 1) {
    const entry = [...matches.entries()][0];
    if (!entry) return { matchStatus: 'UNMATCHED' };
    const [patientId, identifier] = entry;
    return { patientId, matchStatus: 'MATCHED', identifier };
  }
  if (matches.size > 1) return { matchStatus: 'REVIEW_REQUIRED' };
  return { matchStatus: 'UNMATCHED' };
}
