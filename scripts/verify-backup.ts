import Database from 'better-sqlite3';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { decryptBackup } from '../src/lib/backup-crypto';

const backup = process.argv[2];
const passphrase = process.env.BACKUP_ENCRYPTION_KEY;
if (!backup) throw new Error('Usage: npm run backup:verify -- <encrypted-backup>');
if (!passphrase) throw new Error('BACKUP_ENCRYPTION_KEY is required');

const directory = mkdtempSync(path.join(tmpdir(), 'zuzim-restore-'));
const restored = path.join(directory, 'restored.sqlite');
try {
  writeFileSync(restored, decryptBackup(readFileSync(backup), passphrase), { mode: 0o600 });
  const database = new Database(restored, { readonly: true });
  const result = database.pragma('integrity_check', { simple: true });
  database.close();
  if (result !== 'ok') throw new Error(`SQLite integrity check failed: ${String(result)}`);
  console.log('Backup decrypted and SQLite integrity check passed.');
} finally {
  rmSync(directory, { recursive: true, force: true });
}
