import Database from 'better-sqlite3';
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { encryptBackup } from '../src/lib/backup-crypto';

const source = process.env.ZUZIM_DB_PATH ?? path.join(process.cwd(), 'zuzim.db');
const passphrase = process.env.BACKUP_ENCRYPTION_KEY;
if (!passphrase || passphrase.length < 24) throw new Error('BACKUP_ENCRYPTION_KEY must contain at least 24 characters');

const directory = process.env.BACKUP_DIR ?? path.join(process.cwd(), 'backups');
mkdirSync(directory, { recursive: true, mode: 0o700 });
const stamp = new Date().toISOString().replaceAll(':', '-');
const temporary = path.join(directory, `.zuzim-${stamp}.sqlite`);
const destination = path.join(directory, `zuzim-${stamp}.sqlite.enc`);

async function main(): Promise<void> {
  const database = new Database(source, { readonly: true });
  try {
    await database.backup(temporary);
    writeFileSync(destination, encryptBackup(readFileSync(temporary), passphrase!), { mode: 0o600 });
    console.log(destination);
  } finally {
    database.close();
    try { unlinkSync(temporary); } catch { /* backup did not reach the temporary-file stage */ }
  }
}

void main();
