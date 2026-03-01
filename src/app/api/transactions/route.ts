import { NextRequest, NextResponse } from 'next/server';
import { queryTransactions } from '@/lib/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;

  const filter = {
    search: searchParams.get('search') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    account: searchParams.get('account') ?? undefined,
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
  };

  try {
    const result = queryTransactions(filter);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
