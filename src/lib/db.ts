import Database from 'better-sqlite3';
import path from 'path';
import { applyMigrations } from './migrations';

export const DB_PATH = process.env.ZUZIM_DB_PATH ?? path.join(process.cwd(), 'zuzim.db');

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('busy_timeout = 5000');
    applyMigrations(dbInstance);
  }
  return dbInstance;
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

export interface AccountBalance {
  account_id: string;
  balance: number;
  as_of: string;
}

export function upsertAccountBalance(accountId: string, balance: number): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO account_balances (account_id, balance, as_of)
    VALUES (@account_id, @balance, CURRENT_TIMESTAMP)
    ON CONFLICT(account_id) DO UPDATE SET balance = @balance, as_of = CURRENT_TIMESTAMP
  `).run({ account_id: accountId, balance });
}

export function getAccountBalances(): AccountBalance[] {
  const db = getDb();
  return db.prepare('SELECT * FROM account_balances').all() as AccountBalance[];
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
  incomeTotal: number;
  spendTotal: number;
}

// The Leumi bank account's monthly card-bill debit is the same money already counted as
// individual card charges on visa_cal/max — summing both would double-count every card
// purchase. Bank outflows are excluded from spend/category aggregates; bank income (salary,
// transfers in) is kept since cards never produce income rows, so there's nothing to double-count there.
const EXCLUDE_BANK_OUTFLOW = `NOT (account_id = 'leumi_bank' AND amount < 0)`;

export function querySummary(from: string, to: string): SummaryData {
  const db = getDb();

  const daily = db.prepare(`
    SELECT date, SUM(amount) as total, COUNT(*) as count
    FROM transactions
    WHERE date >= @from AND date <= @to AND ${EXCLUDE_BANK_OUTFLOW}
    GROUP BY date
    ORDER BY date ASC
  `).all({ from, to }) as DailySummary[];

  // Expense categories only — Income would otherwise dominate the pie chart and hide where money actually goes.
  const categoryBreakdown = db.prepare(`
    SELECT category, SUM(amount) as total, COUNT(*) as count
    FROM transactions
    WHERE date >= @from AND date <= @to AND amount < 0 AND account_id != 'leumi_bank'
    GROUP BY category
    ORDER BY total ASC
  `).all({ from, to }) as CategorySummary[];

  const aggregates = db.prepare(`
    SELECT
      SUM(amount) as totalAmount,
      COUNT(*) as transactionCount,
      SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as incomeTotal,
      SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as spendTotal
    FROM transactions
    WHERE date >= @from AND date <= @to AND ${EXCLUDE_BANK_OUTFLOW}
  `).get({ from, to }) as { totalAmount: number; transactionCount: number; incomeTotal: number; spendTotal: number };

  return {
    daily,
    categoryBreakdown,
    totalAmount: aggregates.totalAmount ?? 0,
    transactionCount: aggregates.transactionCount ?? 0,
    incomeTotal: aggregates.incomeTotal ?? 0,
    spendTotal: aggregates.spendTotal ?? 0,
  };
}

export interface RecurringCharge {
  description: string;
  category: string;
  monthsSeen: number;
  avgAmount: number;
  lastDate: string;
}

export interface MerchantSpend {
  description: string;
  category: string;
  total: number;
  count: number;
}

export interface CategoryDelta {
  category: string;
  currentTotal: number;
  previousTotal: number;
  percentChange: number | null;
}

export interface InsightsData {
  recurringCharges: RecurringCharge[];
  topMerchants: MerchantSpend[];
  categoryDeltas: CategoryDelta[];
}

// ponytail: exact-description match to detect recurring charges — merchants that vary their
// description slightly (extra reference numbers, etc.) won't be caught. Upgrade to fuzzy/prefix
// matching if that turns out to miss real subscriptions.
export function getInsights(currentMonthFrom: string, currentMonthTo: string, previousMonthFrom: string, previousMonthTo: string): InsightsData {
  const db = getDb();

  const recurringCharges = db.prepare(`
    SELECT
      description,
      category,
      COUNT(DISTINCT strftime('%Y-%m', date)) as monthsSeen,
      AVG(amount) as avgAmount,
      MAX(date) as lastDate
    FROM transactions
    WHERE amount < 0 AND account_id != 'leumi_bank'
    GROUP BY description
    HAVING monthsSeen >= 2 AND COUNT(*) <= monthsSeen + 1
    ORDER BY avgAmount ASC
    LIMIT 20
  `).all() as RecurringCharge[];

  const topMerchants = db.prepare(`
    SELECT description, category, SUM(amount) as total, COUNT(*) as count
    FROM transactions
    WHERE amount < 0 AND account_id != 'leumi_bank' AND date >= @from AND date <= @to
    GROUP BY description
    ORDER BY total ASC
    LIMIT 10
  `).all({ from: currentMonthFrom, to: currentMonthTo }) as MerchantSpend[];

  const currentByCategory = db.prepare(`
    SELECT category, SUM(amount) as total
    FROM transactions
    WHERE amount < 0 AND account_id != 'leumi_bank' AND date >= @from AND date <= @to
    GROUP BY category
  `).all({ from: currentMonthFrom, to: currentMonthTo }) as { category: string; total: number }[];

  const previousByCategory = db.prepare(`
    SELECT category, SUM(amount) as total
    FROM transactions
    WHERE amount < 0 AND account_id != 'leumi_bank' AND date >= @from AND date <= @to
    GROUP BY category
  `).all({ from: previousMonthFrom, to: previousMonthTo }) as { category: string; total: number }[];

  const previousTotals = new Map(previousByCategory.map(row => [row.category, row.total]));
  const categoryDeltas: CategoryDelta[] = currentByCategory.map(row => {
    const previousTotal = previousTotals.get(row.category) ?? 0;
    const percentChange = previousTotal !== 0 ? ((row.total - previousTotal) / previousTotal) * 100 : null;
    return { category: row.category, currentTotal: row.total, previousTotal, percentChange };
  });

  return { recurringCharges, topMerchants, categoryDeltas };
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
