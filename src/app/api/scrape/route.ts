import { NextResponse } from 'next/server';
import { scrapeAllAccounts } from '@/lib/scraper';

export async function POST(): Promise<NextResponse> {
  try {
    const results = await scrapeAllAccounts();

    const totalScraped = results.reduce((sum, r) => sum + r.scrapedCount, 0);
    const errors = results
      .filter(r => r.error)
      .map(r => `${r.accountId}: ${r.error}`);

    return NextResponse.json({ scraped: totalScraped, errors });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ scraped: 0, errors: [message] }, { status: 500 });
  }
}
