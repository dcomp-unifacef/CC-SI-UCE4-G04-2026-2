export const evolutionConfig = {
  enabled: process.env.EVOLUTION_API_ENABLED === 'true',
  baseUrl: process.env.EVOLUTION_API_URL?.trim().replace(/\/+$/, ''),
  apiKey: process.env.EVOLUTION_API_KEY,
  instance: process.env.EVOLUTION_INSTANCE,
  testRecipients: (process.env.EVOLUTION_TEST_RECIPIENTS ?? '')
    .split(',')
    .map((value) => value.replace(/\D/g, ''))
    .filter(Boolean),
  timeoutMs: Number(process.env.EVOLUTION_API_TIMEOUT_MS ?? 10_000),
};
