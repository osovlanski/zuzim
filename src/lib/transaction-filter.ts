import type { TransactionFilter } from './db';

function parsePositiveInteger(value: string | null, name: string, fallback: number, maximum: number): number {
  if (value === null) return fallback;
  if (!/^\d+$/.test(value)) throw new Error(`${name} must be a positive integer`);
  const parsed = Number(value);
  if (parsed < 1 || parsed > maximum) throw new Error(`${name} must be between 1 and ${maximum}`);
  return parsed;
}

function parseIsoDate(value: string | null, name: string): string | undefined {
  if (value === null) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    throw new Error(`${name} must be an ISO date (YYYY-MM-DD)`);
  }
  return value;
}

function optionalText(params: URLSearchParams, name: string): string | undefined {
  const value = params.get(name)?.trim();
  return value || undefined;
}

export function parseTransactionFilter(params: URLSearchParams): TransactionFilter {
  const from = parseIsoDate(params.get('from'), 'from');
  const to = parseIsoDate(params.get('to'), 'to');
  if (from && to && from > to) throw new Error('from must not be after to');

  return {
    ...(optionalText(params, 'search') ? { search: optionalText(params, 'search') } : {}),
    ...(optionalText(params, 'category') ? { category: optionalText(params, 'category') } : {}),
    ...(optionalText(params, 'account') ? { account: optionalText(params, 'account') } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    page: parsePositiveInteger(params.get('page'), 'page', 1, 100_000),
    limit: parsePositiveInteger(params.get('limit'), 'limit', 50, 100),
  };
}
