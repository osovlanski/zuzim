import { timingSafeEqual } from 'node:crypto';

type SecurityEnvironment = Partial<Record<'NODE_ENV' | 'APP_USER' | 'APP_PASSWORD' | 'CRON_SECRET', string>>;

export type SecurityConfigurationResult =
  | { ok: true }
  | { ok: false; reason: string };

function safeEqual(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function validateSecurityConfiguration(env: SecurityEnvironment): SecurityConfigurationResult {
  if (env.NODE_ENV === 'production' && (!env.APP_USER || !env.APP_PASSWORD)) {
    return { ok: false, reason: 'APP_USER and APP_PASSWORD are required in production' };
  }
  return { ok: true };
}

export function authorizeBasicCredentials(
  authorization: string | null | undefined,
  expectedUser: string,
  expectedPassword: string,
): boolean {
  if (!authorization?.startsWith('Basic ')) return false;

  let decoded: string;
  try {
    decoded = Buffer.from(authorization.slice(6), 'base64').toString('utf-8');
  } catch {
    return false;
  }

  const separator = decoded.indexOf(':');
  if (separator < 0) return false;
  return safeEqual(decoded.slice(0, separator), expectedUser)
    && safeEqual(decoded.slice(separator + 1), expectedPassword);
}

export function authorizeCronRequest(
  authorization: string | null | undefined,
  cronSecret: string | undefined,
): boolean {
  if (!cronSecret || !authorization?.startsWith('Bearer ')) return false;
  return safeEqual(authorization.slice(7), cronSecret);
}
