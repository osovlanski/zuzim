import { NextResponse } from 'next/server';

// S&P 500 index plus a small watchlist. Data only — no buy/sell signals (not financial advice).
const SYMBOLS = ['^GSPC', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA'];

const SYMBOL_LABELS: Record<string, string> = {
  '^GSPC': 'S&P 500',
  AAPL: 'Apple',
  MSFT: 'Microsoft',
  GOOGL: 'Alphabet',
  AMZN: 'Amazon',
  NVDA: 'Nvidia',
  TSLA: 'Tesla',
};

interface YahooChartResponse {
  chart: {
    result: [{
      meta: { regularMarketPrice: number; chartPreviousClose: number; currency: string };
      indicators: { quote: [{ close: (number | null)[] }] };
    }] | null;
    error: { description: string } | null;
  };
}

interface StockQuote {
  symbol: string;
  label: string;
  price: number;
  previousClose: number;
  percentChange: number;
  currency: string;
  sparkline: number[];
  error?: string;
}

async function fetchQuote(symbol: string): Promise<StockQuote> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1mo&interval=1d`;
  const label = SYMBOL_LABELS[symbol] ?? symbol;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error(`Yahoo Finance returned ${response.status}`);

    const data = (await response.json()) as YahooChartResponse;
    const result = data.chart.result?.[0];
    if (!result) throw new Error(data.chart.error?.description ?? 'No data returned');

    const { regularMarketPrice, chartPreviousClose, currency } = result.meta;
    const sparkline = (result.indicators.quote[0]?.close ?? []).filter((v): v is number => v !== null);

    return {
      symbol,
      label,
      price: regularMarketPrice,
      previousClose: chartPreviousClose,
      percentChange: ((regularMarketPrice - chartPreviousClose) / chartPreviousClose) * 100,
      currency,
      sparkline,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { symbol, label, price: 0, previousClose: 0, percentChange: 0, currency: 'USD', sparkline: [], error: message };
  }
}

export async function GET(): Promise<NextResponse> {
  const quotes = await Promise.all(SYMBOLS.map(fetchQuote));
  return NextResponse.json({ quotes, fetchedAt: new Date().toISOString() });
}
