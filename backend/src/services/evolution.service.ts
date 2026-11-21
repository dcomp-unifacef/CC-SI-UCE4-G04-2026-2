import { randomUUID } from 'node:crypto';
import { evolutionConfig } from '../config/evolution.config';
import { ConflictError } from '../errors/ConflictError';
import { IntegrationError } from '../errors/IntegrationError';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { recordAudit } from './audit.service';

type ProviderResponse = Record<string, unknown>;

function getConfig() {
  if (!evolutionConfig.enabled)
    throw new ConflictError('Evolution API test sending is disabled');
  if (
    !evolutionConfig.baseUrl ||
    !evolutionConfig.apiKey ||
    !evolutionConfig.instance
  ) {
    throw new IntegrationError('Evolution API is not fully configured');
  }
  if (
    process.env.NODE_ENV === 'production' &&
    !evolutionConfig.baseUrl.startsWith('https://')
  ) {
    throw new IntegrationError('Evolution API must use HTTPS in production');
  }
  return {
    baseUrl: evolutionConfig.baseUrl,
    apiKey: evolutionConfig.apiKey,
    instance: evolutionConfig.instance,
  };
}

async function request(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<ProviderResponse> {
  const config = getConfig();
  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}${path}`, {
      method: init.method ?? 'GET',
      headers: {
        apikey: config.apiKey,
        ...(init.body ? { 'content-type': 'application/json' } : {}),
      },
      ...(init.body ? { body: JSON.stringify(init.body) } : {}),
      signal: AbortSignal.timeout(evolutionConfig.timeoutMs),
    });
  } catch {
    throw new IntegrationError('Could not reach the Evolution API');
  }

  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new IntegrationError(
      `Evolution API returned HTTP ${response.status}`,
    );
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    return {};
  return payload as ProviderResponse;
}

function readNestedString(
  value: unknown,
  paths: string[][],
): string | undefined {
  for (const path of paths) {
    let current: unknown = value;
    for (const key of path) {
      if (!current || typeof current !== 'object') {
        current = undefined;
        break;
      }
      current = (current as Record<string, unknown>)[key];
    }
    if (typeof current === 'string' && current.length > 0) return current;
  }
  return undefined;
}

export async function connectionStatus() {
  if (!evolutionConfig.enabled)
    return { enabled: false, connected: false, state: 'DISABLED' };
  const config = getConfig();
  const result = await request(
    `/instance/connectionState/${encodeURIComponent(config.instance)}`,
  );
  const state = (
    readNestedString(result, [
      ['instance', 'state'],
      ['state'],
      ['connectionStatus'],
    ]) ?? 'unknown'
  ).toLowerCase();
  return {
    enabled: true,
    connected: state === 'open' || state === 'connected',
    state,
  };
}

export async function createPairingQr(actorId: string) {
  const config = getConfig();
  const result = await request(
    `/instance/connect/${encodeURIComponent(config.instance)}`,
  );
  const base64 = readNestedString(result, [
    ['base64'],
    ['qrcode', 'base64'],
    ['qr', 'base64'],
  ]);
  const code = readNestedString(result, [
    ['code'],
    ['qrcode', 'code'],
    ['qr', 'code'],
  ]);
  const pairingCode = readNestedString(result, [
    ['pairingCode'],
    ['qrcode', 'pairingCode'],
    ['qr', 'pairingCode'],
  ]);
  const count = typeof result.count === 'number' ? result.count : undefined;
  if (!base64 && !code && !pairingCode)
    throw new IntegrationError(
      'Evolution API did not return a pairing QR code',
    );
  await recordAudit({
    actorId,
    entityType: 'EvolutionApi',
    entityId: config.instance,
    action: 'PAIRING_QR_REQUESTED',
    fields: ['connection'],
  });
  return { base64, code, pairingCode, count };
}

export async function sendTestMessage(
  recipient: string,
  message: string,
  actorId: string,
) {
  const normalizedRecipient = recipient.replace(/\D/g, '');
  const allowedRecipients = new Set(evolutionConfig.testRecipients);
  if (!allowedRecipients.size || !allowedRecipients.has(normalizedRecipient)) {
    throw new UnauthorizedError(
      'Recipient is not in EVOLUTION_TEST_RECIPIENTS',
    );
  }
  const status = await connectionStatus();
  if (!status.connected)
    throw new ConflictError('WhatsApp instance is not connected');
  const config = getConfig();
  const response = await request(
    `/message/sendText/${encodeURIComponent(config.instance)}`,
    {
      method: 'POST',
      body: { number: normalizedRecipient, text: message, linkPreview: false },
    },
  );
  const providerMessageId = readNestedString(response, [
    ['key', 'id'],
    ['messageId'],
    ['id'],
  ]);
  await recordAudit({
    actorId,
    entityType: 'EvolutionApiTest',
    entityId: providerMessageId ?? randomUUID(),
    action: 'TEST_MESSAGE_SENT',
    fields: ['recipient', 'message'],
  });
  return { accepted: true, providerMessageId };
}
