'use client';

import { useState, useEffect, useCallback } from 'react';
import SummaryCards from '@/components/SummaryCards';
import CategoryChart from '@/components/CategoryChart';
import TransactionTable from '@/components/TransactionTable';
import ScrapeButton from '@/components/ScrapeButton';
import SpendingInsights from '@/components/SpendingInsights';
import StocksPanel from '@/components/StocksPanel';

interface AccountBalance {
  account_id: string;
  balance: number;
  as_of: string;
}

interface SummaryApiResponse {
  todayTotal: number;
  todayCount: number;
  weekTotal: number;
  weekCount: number;
  totalAmount: number;
  transactionCount: number;
  incomeTotal: number;
  spendTotal: number;
  categoryBreakdown: { category: string; total: number; count: number }[];
  balances: AccountBalance[];
  lastScraped: string | null;
  scrapeHealth: Array<{
    accountId: string;
    lastAttemptAt: string;
    status: 'success' | 'error';
    transactionCount: number;
  }>;
}

const ACCOUNT_LABELS: Record<string, string> = {
  visa_cal: 'Visa Cal',
  max: 'Max',
  leumi_bank: 'Leumi Bank',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryApiResponse | null>(null);
  const [tableKey, setTableKey] = useState(0);

  const fetchSummary = useCallback(async () => {
    const response = await fetch('/api/summary');
    const data = await response.json();
    setSummary(data);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, same pattern as TransactionTable/SpendingInsights/StocksPanel
    void fetchSummary();
  }, [fetchSummary]);

  function handleScrapeComplete() {
    fetchSummary();
    setTableKey(k => k + 1);
  }

  function formatLastScraped(timestamp: string | null): string {
    if (!timestamp) return 'Never synced';
    const date = new Date(timestamp);
    return `Last synced ${date.toLocaleString('he-IL')}`;
  }

  return (
    <div className="min-h-screen">
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg text-xl select-none">
              &#x1FA99;
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">Zuzim</h1>
              <p className="text-xs text-slate-500 leading-tight">
                {summary ? formatLastScraped(summary.lastScraped) : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-400 hidden sm:block">{getGreeting()}</p>
            <ScrapeButton onScrapeComplete={handleScrapeComplete} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {summary ? (
          <div className="animate-fade-in-up">
            <SummaryCards
              todayTotal={summary.todayTotal}
              weekTotal={summary.weekTotal}
              monthTotal={summary.spendTotal}
              todayCount={summary.todayCount}
              weekCount={summary.weekCount}
              monthCount={summary.transactionCount}
              incomeTotal={summary.incomeTotal}
              spendTotal={summary.spendTotal}
            />
            {summary.balances.length > 0 && (
              <div className="mt-4 glass-card rounded-2xl p-4 flex flex-wrap gap-6">
                {summary.balances.map(b => (
                  <div key={b.account_id}>
                    <p className="text-xs text-slate-500">{ACCOUNT_LABELS[b.account_id] ?? b.account_id} balance</p>
                    <p className="text-lg font-semibold text-white">
                      ₪{b.balance.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {summary.scrapeHealth.length > 0 && (
              <div className="mt-4 glass-card rounded-2xl p-4" aria-label="Account sync health">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Account sync health</p>
                <div className="flex flex-wrap gap-4">
                  {summary.scrapeHealth.map(account => (
                    <div key={account.accountId} className="flex items-center gap-2 text-sm">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${account.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}
                        aria-hidden="true"
                      />
                      <span className="text-slate-300">{ACCOUNT_LABELS[account.accountId] ?? account.accountId}</span>
                      <span className="text-slate-500">
                        {account.status === 'success' ? `${account.transactionCount} imported` : 'Sync failed'} ·{' '}
                        {new Date(`${account.lastAttemptAt}Z`).toLocaleString('he-IL')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="glass-card rounded-2xl p-6 h-32 animate-pulse" />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 glass-card rounded-2xl p-6">
            <h2 className="text-base font-semibold text-slate-200 mb-4">Spending by Category</h2>
            {summary ? (
              <CategoryChart data={summary.categoryBreakdown} />
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-600">Loading...</div>
            )}
          </div>

          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <h2 className="text-base font-semibold text-slate-200 mb-4">Transactions</h2>
            <TransactionTable key={tableKey} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-base font-semibold text-slate-200 mb-4">Spending Insights</h2>
            <SpendingInsights />
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-base font-semibold text-slate-200 mb-4">Markets</h2>
            <StocksPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
