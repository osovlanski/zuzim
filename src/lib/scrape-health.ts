import type Database from 'better-sqlite3';

export interface ScrapeHealth {
  accountId: string;
  lastAttemptAt: string;
  status: 'success' | 'error';
  transactionCount: number;
}

export function queryScrapeHealth(db: Database.Database): ScrapeHealth[] {
  return db.prepare(`
    SELECT
      latest.account_id AS accountId,
      latest.scraped_at AS lastAttemptAt,
      latest.status,
      latest.transaction_count AS transactionCount
    FROM scrape_log latest
    WHERE latest.id = (
      SELECT candidate.id
      FROM scrape_log candidate
      WHERE candidate.account_id = latest.account_id
      ORDER BY candidate.scraped_at DESC, candidate.id DESC
      LIMIT 1
    )
    ORDER BY latest.account_id
  `).all() as ScrapeHealth[];
}
