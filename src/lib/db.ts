import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'zuzim.db');

let dbInstance: Database.Database | null = null;

function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    initializeSchema(dbInstance);
  }
  return dbInstance;
}

function initializeSchema(db: Database.Database): void {
  db.exec(`
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
  `);
}

export interface Transaction {
  id: string;
  account_id: string;
  date: string;
  process_date: string | null;
  description: string;
  amount: number;
  currency: string;
  category: string;
  memo: string | null;
  status: string;
  type: string;
  created_at: string;
}

export interface ScrapeLogEntry {
  id: number;
  account_id: string;
  scraped_at: string;
  status: string;
  error_message: string | null;
  transaction_count: number;
}

export interface TransactionFilter {
  search?: string;
  category?: string;
  account?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export function upsertTransaction(tx: Omit<Transaction, 'created_at'>): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO transactions
      (id, account_id, date, process_date, description, amount, currency, category, memo, status, type)
    VALUES
      (@id, @account_id, @date, @process_date, @description, @amount, @currency, @category, @memo, @status, @type)
  `);
  stmt.run(tx);
}

export function insertScrapeLog(entry: Omit<ScrapeLogEntry, 'id' | 'scraped_at'>): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO scrape_log (account_id, status, error_message, transaction_count)
    VALUES (@account_id, @status, @error_message, @transaction_count)
  `).run(entry);
}

export function queryTransactions(filter: TransactionFilter): { transactions: Transaction[]; total: number } {
  const db = getDb();
  const pageSize = filter.limit ?? 50;
  const pageOffset = ((filter.page ?? 1) - 1) * pageSize;

  const conditions: string[] = [];
  const params: Record<string, string | number> = {};

  if (filter.search) {
    conditions.push("description LIKE @search");
    params.search = `%${filter.search}%`;
  }
  if (filter.category) {
    conditions.push("category = @category");
    params.category = filter.category;
  }
  if (filter.account) {
    conditions.push("account_id = @account");
    params.account = filter.account;
  }
  if (filter.from) {
    conditions.push("date >= @from");
    params.from = filter.from;
  }
  if (filter.to) {
    conditions.push("date <= @to");
    params.to = filter.to;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const total = (db.prepare(`SELECT COUNT(*) as count FROM transactions ${whereClause}`).get(params) as { count: number }).count;
  const transactions = db.prepare(`
    SELECT * FROM transactions ${whereClause}
    ORDER BY date DESC, created_at DESC
    LIMIT @limit OFFSET @offset
  `).all({ ...params, limit: pageSize, offset: pageOffset }) as Transaction[];

  return { transactions, total };
}

export interface DailySummary {
  date: string;
  total: number;
  count: number;
}

export interface CategorySummary {
  category: string;
  total: number;
  count: number;
}

export interface SummaryData {
  daily: DailySummary[];
  categoryBreakdown: CategorySummary[];
  totalAmount: number;
  transactionCount: number;
}

export function querySummary(from: string, to: string): SummaryData {
  const db = getDb();

  const daily = db.prepare(`
    SELECT date, SUM(amount) as total, COUNT(*) as count
    FROM transactions
    WHERE date >= @from AND date <= @to
    GROUP BY date
    ORDER BY date ASC
  `).all({ from, to }) as DailySummary[];

  const categoryBreakdown = db.prepare(`
    SELECT category, SUM(amount) as total, COUNT(*) as count
    FROM transactions
    WHERE date >= @from AND date <= @to
    GROUP BY category
    ORDER BY total ASC
  `).all({ from, to }) as CategorySummary[];

  const aggregates = db.prepare(`
    SELECT SUM(amount) as totalAmount, COUNT(*) as transactionCount
    FROM transactions
    WHERE date >= @from AND date <= @to
  `).get({ from, to }) as { totalAmount: number; transactionCount: number };

  return {
    daily,
    categoryBreakdown,
    totalAmount: aggregates.totalAmount ?? 0,
    transactionCount: aggregates.transactionCount ?? 0,
  };
}

export function getLastScrapeTime(): string | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT scraped_at FROM scrape_log
    WHERE status = 'success'
    ORDER BY scraped_at DESC
    LIMIT 1
  `).get() as { scraped_at: string } | undefined;
  return row?.scraped_at ?? null;
}
