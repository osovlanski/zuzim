import type Database from 'better-sqlite3';

interface Migration {
  version: number;
  sql: string;
}

const migrations: Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        date TEXT NOT NULL,
        process_date TEXT,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'ILS',
        category TEXT DEFAULT 'Other',
        memo TEXT,
        status TEXT DEFAULT 'Completed',
        type TEXT DEFAULT 'Normal',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS scrape_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id TEXT NOT NULL,
        scraped_at TEXT DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL,
        error_message TEXT,
        transaction_count INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS account_balances (
        account_id TEXT PRIMARY KEY,
        balance REAL NOT NULL,
        as_of TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
  {
    version: 2,
    sql: `
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
      CREATE INDEX IF NOT EXISTS idx_transactions_account_date ON transactions(account_id, date DESC);
      CREATE INDEX IF NOT EXISTS idx_scrape_log_account_time ON scrape_log(account_id, scraped_at DESC);
    `,
  },
];

export function applyMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  const applied = new Set(
    (db.prepare('SELECT version FROM schema_migrations').all() as Array<{ version: number }>).map(({ version }) => version),
  );
  const record = db.prepare('INSERT INTO schema_migrations (version) VALUES (?)');

  for (const migration of migrations) {
    if (applied.has(migration.version)) continue;
    db.transaction(() => {
      db.exec(migration.sql);
      record.run(migration.version);
    })();
  }
}
