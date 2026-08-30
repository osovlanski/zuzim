import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

const MAGIC = Buffer.from('ZUZIMBK1');
const SALT_BYTES = 16;
const IV_BYTES = 12;
const TAG_BYTES = 16;

export function encryptBackup(plaintext: Buffer, passphrase: string): Buffer {
  const salt = randomBytes(SALT_BYTES);
  const iv = randomBytes(IV_BYTES);
  const key = scryptSync(passphrase, salt, 32);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([MAGIC, salt, iv, cipher.getAuthTag(), ciphertext]);
}

export function decryptBackup(payload: Buffer, passphrase: string): Buffer {
  if (!payload.subarray(0, MAGIC.length).equals(MAGIC)) throw new Error('Invalid Zuzim backup');
  let offset = MAGIC.length;
  const salt = payload.subarray(offset, offset += SALT_BYTES);
  const iv = payload.subarray(offset, offset += IV_BYTES);
  const tag = payload.subarray(offset, offset += TAG_BYTES);
  const key = scryptSync(passphrase, salt, 32);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(payload.subarray(offset)), decipher.final()]);
}
