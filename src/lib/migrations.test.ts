import assert from 'node:assert/strict';
import test from 'node:test';
import Database from 'better-sqlite3';
import { applyMigrations } from './migrations';

test('should create the current schema and record its version', () => {
  const db = new Database(':memory:');
  applyMigrations(db);

  const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  ).all() as Array<{ name: string }>;

  assert.deepEqual(tables.map(({ name }) => name), [
    'account_balances',
    'schema_migrations',
    'scrape_log',
    'transactions',
  ]);
  assert.deepEqual(
    db.prepare('SELECT version FROM schema_migrations ORDER BY version').all(),
    [{ version: 1 }, { version: 2 }],
  );
  db.close();
});

test('should be safe to run repeatedly', () => {
  const db = new Database(':memory:');
  applyMigrations(db);
  applyMigrations(db);
  assert.equal((db.prepare('SELECT COUNT(*) AS count FROM schema_migrations').get() as { count: number }).count, 2);
  db.close();
});
