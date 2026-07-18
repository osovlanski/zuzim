import 'dotenv/config';

async function main() {
  // Deferred import: eagerly importing israeli-bank-scrapers (puppeteer, yargs et al.)
  // at module load time breaks tsx's ESM loader (yargs uses require() internally).
  const { scrapeAllAccounts } = await import('../src/lib/scraper');
  const { sendDailySummary, sendAlert } = await import('../src/lib/telegram');

  console.log('Starting scrape run...');

  const results = await scrapeAllAccounts();

  for (const result of results) {
    if (result.error) {
      console.error(`[${result.accountId}] Error: ${result.error}`);
      await sendAlert(`⚠️ Scrape failed for *${result.accountId}*: ${result.error}`);
    } else {
      console.log(`[${result.accountId}] Scraped ${result.scrapedCount} transactions`);
    }
  }

  const totalScraped = results.reduce((sum, r) => sum + r.scrapedCount, 0);
  console.log(`Total new transactions: ${totalScraped}`);

  await sendDailySummary();
  console.log('Daily summary sent to Telegram');
}

main().catch(async (err) => {
  console.error('Fatal error:', err);
  const { sendAlert } = await import('../src/lib/telegram');
  await sendAlert(`🚨 Zuzim scrape script crashed: ${err.message}`).catch(() => {});
  process.exit(1);
});
