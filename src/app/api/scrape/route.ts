import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  try {
    // Deferred import: eagerly importing israeli-bank-scrapers (puppeteer et al.) at module
    // load time breaks Next's build-time "collect page data" step. Load it only when the
    // route actually runs.
    const { scrapeAllAccounts } = await import('@/lib/scraper');
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
