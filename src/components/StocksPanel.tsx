'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

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

function formatPrice(price: number, currency: string): string {
  const symbol = currency === 'USD' ? '$' : currency;
  return `${symbol}${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function StocksPanel() {
  const [quotes, setQuotes] = useState<StockQuote[] | null>(null);

  useEffect(() => {
    fetch('/api/stocks')
      .then(res => res.json())
      .then(data => setQuotes(data.quotes ?? []));
  }, []);

  if (!quotes) {
    return <div className="flex items-center justify-center h-32 text-slate-600">Loading...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quotes.map(q => {
          const isUp = q.percentChange >= 0;
          return (
            <div key={q.symbol} className="glass-card rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{q.label}</p>
                {q.error ? (
                  <p className="text-xs text-slate-600">unavailable</p>
                ) : (
                  <>
                    <p className="text-lg font-bold text-white">{formatPrice(q.price, q.currency)}</p>
                    <p className={`text-xs font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isUp ? '▲' : '▼'} {Math.abs(q.percentChange).toFixed(2)}% <span className="text-slate-600 font-normal">(1mo)</span>
                    </p>
                  </>
                )}
              </div>
              {q.sparkline.length > 1 && (
                <div className="w-20 h-10 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={q.sparkline.map(value => ({ value }))}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={isUp ? '#34d399' : '#f87171'}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-600">Price data only, not financial advice.</p>
    </div>
  );
}
