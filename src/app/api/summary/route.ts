import { NextRequest, NextResponse } from 'next/server';
import { querySummary, getLastScrapeTime, getAccountBalances, getDb } from '@/lib/db';
import { queryScrapeHealth } from '@/lib/scrape-health';

function getMonthRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return { from, to };
}

function getWeekRange(): { from: string; to: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  return {
    from: weekStart.toISOString().split('T')[0],
    to: now.toISOString().split('T')[0],
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const today = new Date().toISOString().split('T')[0];

  const from = searchParams.get('from') ?? getMonthRange().from;
  const to = searchParams.get('to') ?? getMonthRange().to;

  try {
    const main = querySummary(from, to);
    const todaySummary = querySummary(today, today);
    const weekRange = getWeekRange();
    const weekSummary = querySummary(weekRange.from, weekRange.to);
    const lastScraped = getLastScrapeTime();
    const balances = getAccountBalances();
    const scrapeHealth = queryScrapeHealth(getDb());

    return NextResponse.json({
      ...main,
      todayTotal: todaySummary.totalAmount,
      todayCount: todaySummary.transactionCount,
      weekTotal: weekSummary.totalAmount,
      weekCount: weekSummary.transactionCount,
      balances,
      scrapeHealth,
      lastScraped,
      from,
      to,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
