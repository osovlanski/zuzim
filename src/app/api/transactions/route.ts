import { NextRequest, NextResponse } from 'next/server';
import { queryTransactions } from '@/lib/db';
import { parseTransactionFilter } from '@/lib/transaction-filter';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const filter = parseTransactionFilter(request.nextUrl.searchParams);
    const result = queryTransactions(filter);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const isValidationError = /^(page|limit|from|to)/.test(message);
    return NextResponse.json({ error: message }, { status: isValidationError ? 400 : 500 });
  }
}
