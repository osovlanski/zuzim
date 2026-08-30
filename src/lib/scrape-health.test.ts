import assert from 'node:assert/strict';
import test from 'node:test';
import Database from 'better-sqlite3';
import { applyMigrations } from './migrations';
import { queryScrapeHealth } from './scrape-health';

test('should return the latest status for each account without exposing raw errors', () => {
  const db = new Database(':memory:');
  applyMigrations(db);
  const insert = db.prepare(`
    INSERT INTO scrape_log (account_id, scraped_at, status, error_message, transaction_count)
    VALUES (?, ?, ?, ?, ?)
  `);
  insert.run('visa_cal', '2026-08-29 08:00:00', 'success', null, 4);
  insert.run('visa_cal', '2026-08-29 09:00:00', 'error', 'credential 1234 leaked by provider', 0);
  insert.run('max', '2026-08-29 08:30:00', 'success', null, 7);

  assert.deepEqual(queryScrapeHealth(db), [
    { accountId: 'max', lastAttemptAt: '2026-08-29 08:30:00', status: 'success', transactionCount: 7 },
    { accountId: 'visa_cal', lastAttemptAt: '2026-08-29 09:00:00', status: 'error', transactionCount: 0 },
  ]);
  db.close();
});
