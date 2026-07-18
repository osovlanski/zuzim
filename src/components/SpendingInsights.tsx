'use client';

import { useState, useEffect } from 'react';

interface RecurringCharge {
  description: string;
  category: string;
  monthsSeen: number;
  avgAmount: number;
  lastDate: string;
}

interface MerchantSpend {
  description: string;
  category: string;
  total: number;
  count: number;
}

interface CategoryDelta {
  category: string;
  currentTotal: number;
  previousTotal: number;
  percentChange: number | null;
}

interface InsightsData {
  recurringCharges: RecurringCharge[];
  topMerchants: MerchantSpend[];
  categoryDeltas: CategoryDelta[];
}

function formatAmount(amount: number): string {
  return `₪${Math.abs(amount).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function SpendingInsights() {
  const [insights, setInsights] = useState<InsightsData | null>(null);

  useEffect(() => {
    fetch('/api/insights')
      .then(res => res.json())
      .then(setInsights);
  }, []);

  if (!insights) {
    return <div className="flex items-center justify-center h-32 text-slate-600">Loading...</div>;
  }

  const risingCategories = insights.categoryDeltas
    .filter(d => d.percentChange !== null && d.percentChange > 20)
    .sort((a, b) => (b.percentChange ?? 0) - (a.percentChange ?? 0));

  return (
    <div className="space-y-6">
      {risingCategories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Consider cutting back</h3>
          <div className="space-y-2">
            {risingCategories.map(d => (
              <div key={d.category} className="flex items-center justify-between rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5">
                <span className="text-sm text-slate-200">{d.category}</span>
                <span className="text-sm font-semibold text-red-300">
                  {formatAmount(d.currentTotal)} <span className="text-xs text-red-400/70">(+{d.percentChange?.toFixed(0)}% vs last month)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Recurring charges</h3>
        {insights.recurringCharges.length === 0 ? (
          <p className="text-sm text-slate-600">None detected yet.</p>
        ) : (
          <div className="space-y-1.5">
            {insights.recurringCharges.map(charge => (
              <div key={charge.description} className="flex items-center justify-between text-sm">
                <span className="text-slate-300 truncate max-w-[60%]">{charge.description}</span>
                <span className="text-slate-500 text-xs">{charge.monthsSeen}mo</span>
                <span className="font-medium text-slate-200">{formatAmount(charge.avgAmount)}/mo</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Top merchants this month</h3>
        {insights.topMerchants.length === 0 ? (
          <p className="text-sm text-slate-600">No spending yet this month.</p>
        ) : (
          <div className="space-y-1.5">
            {insights.topMerchants.map(m => (
              <div key={m.description} className="flex items-center justify-between text-sm">
                <span className="text-slate-300 truncate max-w-[60%]">{m.description}</span>
                <span className="font-medium text-slate-200">{formatAmount(m.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
