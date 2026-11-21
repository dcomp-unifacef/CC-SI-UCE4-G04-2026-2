const isProduction = process.env.NODE_ENV === 'production';

const accessSecret =
  process.env.JWT_ACCESS_SECRET ??
  process.env.JWT_AT_SECRET ??
  process.env.JWT_SECRET;

if (isProduction && (!accessSecret || accessSecret.length < 32)) {
  throw new Error(
    'JWT_ACCESS_SECRET must be set to a random value of at least 32 characters in production',
  );
}

export const authConfig = {
  accessSecret:
    accessSecret ?? 'local-development-only-change-this-secret-please',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  refreshTtlDays: Number(process.env.JWT_REFRESH_TTL_DAYS ?? 7),
  refreshCookieName: 'si_refresh',
  cookieSecure: isProduction,
};
