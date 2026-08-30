import assert from 'node:assert/strict';
import test from 'node:test';
import { parseTransactionFilter } from './transaction-filter';

test('should apply safe pagination defaults', () => {
  assert.deepEqual(parseTransactionFilter(new URLSearchParams()), { page: 1, limit: 50 });
});

test('should accept bounded pagination and ISO dates', () => {
  assert.deepEqual(
    parseTransactionFilter(new URLSearchParams('page=2&limit=25&from=2026-01-01&to=2026-01-31')),
    { page: 2, limit: 25, from: '2026-01-01', to: '2026-01-31' },
  );
});

test('should reject invalid or unbounded pagination', () => {
  assert.throws(() => parseTransactionFilter(new URLSearchParams('page=0')), /page/);
  assert.throws(() => parseTransactionFilter(new URLSearchParams('limit=500')), /limit/);
  assert.throws(() => parseTransactionFilter(new URLSearchParams('page=abc')), /page/);
});

test('should reject invalid and reversed date ranges', () => {
  assert.throws(() => parseTransactionFilter(new URLSearchParams('from=not-a-date')), /from/);
  assert.throws(
    () => parseTransactionFilter(new URLSearchParams('from=2026-02-01&to=2026-01-01')),
    /from must not be after to/,
  );
});
