import { NextResponse } from 'next/server';
import { getInsights } from '@/lib/db';

function getMonthRange(monthsAgo: number): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1).toISOString().split('T')[0];
  const to = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0).toISOString().split('T')[0];
  return { from, to };
}

export async function GET(): Promise<NextResponse> {
  try {
    const current = getMonthRange(0);
    const previous = getMonthRange(1);
    const insights = getInsights(current.from, current.to, previous.from, previous.to);
    return NextResponse.json(insights);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
