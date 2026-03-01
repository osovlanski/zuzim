'use client';

import { useState, useEffect, useCallback } from 'react';
import SummaryCards from '@/components/SummaryCards';
import CategoryChart from '@/components/CategoryChart';
import TransactionTable from '@/components/TransactionTable';
import ScrapeButton from '@/components/ScrapeButton';

interface SummaryApiResponse {
  todayTotal: number;
  todayCount: number;
  weekTotal: number;
  weekCount: number;
  totalAmount: number;
  transactionCount: number;
  categoryBreakdown: { category: string; total: number; count: number }[];
  lastScraped: string | null;
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
    fetchSummary();
  }, [fetchSummary]);

  function handleScrapeComplete() {
    fetchSummary();
    setTableKey(k => k + 1);
  }

  function formatLastScraped(timestamp: string | null): string {
    if (!timestamp) return 'Never scraped';
    const date = new Date(timestamp);
    return `Last scraped: ${date.toLocaleString('he-IL')}`;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Zuzim</h1>
            <p className="text-sm text-gray-400 mt-1">
              {summary ? formatLastScraped(summary.lastScraped) : 'Loading...'}
            </p>
          </div>
          <ScrapeButton onScrapeComplete={handleScrapeComplete} />
        </div>

        {summary && (
          <SummaryCards
            todayTotal={summary.todayTotal}
            weekTotal={summary.weekTotal}
            monthTotal={summary.totalAmount}
            todayCount={summary.todayCount}
            weekCount={summary.weekCount}
            monthCount={summary.transactionCount}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h2>
            {summary ? (
              <CategoryChart data={summary.categoryBreakdown} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Transactions</h2>
            <TransactionTable key={tableKey} />
          </div>
        </div>
      </div>
    </main>
  );
}
