import assert from 'node:assert/strict';
import test from 'node:test';
import { decryptBackup, encryptBackup } from './backup-crypto';

test('should encrypt a backup without leaving plaintext and decrypt it losslessly', () => {
  const plaintext = Buffer.from('SQLite format 3\0private financial data');
  const encrypted = encryptBackup(plaintext, 'a sufficiently long test backup passphrase');

  assert.equal(encrypted.includes(Buffer.from('private financial data')), false);
  assert.deepEqual(decryptBackup(encrypted, 'a sufficiently long test backup passphrase'), plaintext);
});

test('should reject a wrong backup passphrase', () => {
  const encrypted = encryptBackup(Buffer.from('private'), 'correct passphrase for backup encryption');
  assert.throws(() => decryptBackup(encrypted, 'incorrect passphrase for backup encryption'));
});
