import assert from 'node:assert/strict';
import test from 'node:test';
import {
  authorizeBasicCredentials,
  authorizeCronRequest,
  validateSecurityConfiguration,
} from './security';

test('should reject a production configuration without application credentials', () => {
  assert.deepEqual(
    validateSecurityConfiguration({ NODE_ENV: 'production' }),
    { ok: false, reason: 'APP_USER and APP_PASSWORD are required in production' },
  );
});

test('should allow explicit credential-free local development', () => {
  assert.deepEqual(
    validateSecurityConfiguration({ NODE_ENV: 'development' }),
    { ok: true },
  );
});

test('should require both configured Basic credentials to match', () => {
  const encoded = Buffer.from('owner:correct-horse').toString('base64');
  assert.equal(authorizeBasicCredentials(`Basic ${encoded}`, 'owner', 'correct-horse'), true);
  assert.equal(authorizeBasicCredentials(`Basic ${encoded}`, 'owner', 'wrong'), false);
  assert.equal(authorizeBasicCredentials(undefined, 'owner', 'correct-horse'), false);
});

test('should authorize cron only through an exact Bearer header', () => {
  assert.equal(authorizeCronRequest('Bearer cron-secret', 'cron-secret'), true);
  assert.equal(authorizeCronRequest(undefined, 'cron-secret'), false);
  assert.equal(authorizeCronRequest('Bearer wrong', 'cron-secret'), false);
  assert.equal(authorizeCronRequest('Bearer cron-secret', undefined), false);
});
