import { createScraper, CompanyTypes } from 'israeli-bank-scrapers';
import crypto from 'crypto';
import { upsertTransaction, insertScrapeLog } from './db';
import { categorize } from './categorizer';

export interface ScrapeResult {
  accountId: string;
  scrapedCount: number;
  error?: string;
}

interface VisaCalCredentials {
  username: string;
  password: string;
}

interface MaxCredentials {
  username: string;
  password: string;
}

type SupportedCredentials = VisaCalCredentials | MaxCredentials;

function generateTransactionId(accountId: string, date: string, description: string, amount: number): string {
  const raw = `${accountId}:${date}:${description}:${amount}`;
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 32);
}

async function scrapeAccount(
  accountId: string,
  companyId: CompanyTypes,
  credentials: SupportedCredentials,
): Promise<ScrapeResult> {
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  try {
    const scraper = createScraper({
      companyId,
      startDate,
      combineInstallments: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await scraper.scrape(credentials as any);

    if (!result.success) {
      const errorMessage = result.errorMessage ?? 'Unknown scraper error';
      insertScrapeLog({
        account_id: accountId,
        status: 'error',
        error_message: errorMessage,
        transaction_count: 0,
      });
      return { accountId, scrapedCount: 0, error: errorMessage };
    }

    let totalSaved = 0;
    for (const account of result.accounts ?? []) {
      for (const txn of account.txns) {
        const dateStr = new Date(txn.date).toISOString().split('T')[0];
        const processDateStr = txn.processedDate
          ? new Date(txn.processedDate).toISOString().split('T')[0]
          : null;

        const transactionId = generateTransactionId(accountId, dateStr, txn.description, txn.chargedAmount);
        const category = categorize(txn.description);

        upsertTransaction({
          id: transactionId,
          account_id: accountId,
          date: dateStr,
          process_date: processDateStr,
          description: txn.description,
          amount: txn.chargedAmount,
          currency: txn.chargedCurrency ?? 'ILS',
          category,
          memo: txn.memo ?? null,
          status: txn.status ?? 'Completed',
          type: txn.type ?? 'Normal',
        });
        totalSaved++;
      }
    }

    insertScrapeLog({
      account_id: accountId,
      status: 'success',
      error_message: null,
      transaction_count: totalSaved,
    });

    return { accountId, scrapedCount: totalSaved };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    insertScrapeLog({
      account_id: accountId,
      status: 'error',
      error_message: errorMessage,
      transaction_count: 0,
    });
    return { accountId, scrapedCount: 0, error: errorMessage };
  }
}

export async function scrapeAllAccounts(): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];

  if (process.env.VISA_CAL_ID && process.env.VISA_CAL_PASSWORD) {
    const visaCalResult = await scrapeAccount('visa_cal', CompanyTypes.visaCal, {
      username: process.env.VISA_CAL_ID,
      password: process.env.VISA_CAL_PASSWORD,
    });
    results.push(visaCalResult);
  }

  if (process.env.MAX_ID && process.env.MAX_PASSWORD) {
    const maxResult = await scrapeAccount('max', CompanyTypes.max, {
      username: process.env.MAX_ID,
      password: process.env.MAX_PASSWORD,
    });
    results.push(maxResult);
  }

  return results;
}
