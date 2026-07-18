'use client';

import { useState, useEffect, useCallback } from 'react';

interface Transaction {
  id: string;
  account_id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  status: string;
}

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Utilities', 'Income', 'Other'];

const ACCOUNT_LABELS: Record<string, string> = {
  visa_cal: 'Visa Cal',
  max: 'Max',
  leumi_bank: 'Leumi Bank',
};

const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  Food:          { bg: 'bg-orange-500/20', text: 'text-orange-300', icon: '\u{1F354}' },
  Transport:     { bg: 'bg-blue-500/20',   text: 'text-blue-300',   icon: '\u{1F697}' },
  Shopping:      { bg: 'bg-pink-500/20',   text: 'text-pink-300',   icon: '\u{1F6CD}' },
  Health:        { bg: 'bg-emerald-500/20',text: 'text-emerald-300',icon: '\u{1F48A}' },
  Entertainment: { bg: 'bg-purple-500/20', text: 'text-purple-300', icon: '\u{1F3AC}' },
  Utilities:     { bg: 'bg-amber-500/20',  text: 'text-amber-300',  icon: '\u26A1' },
  Income:        { bg: 'bg-green-500/20',  text: 'text-green-300',  icon: '\u{1F4B5}' },
  Other:         { bg: 'bg-slate-500/20',  text: 'text-slate-300',  icon: '\u{1F4E6}' },
};

export default function TransactionTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 20;

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (account) params.set('account', account);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const response = await fetch(`/api/transactions?${params}`);
      const data = await response.json();
      setTransactions(data.transactions ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setIsLoading(false);
    }
  }, [search, category, account, from, to, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const totalPages = Math.ceil(total / limit);

  function formatAmount(amount: number, currency: string): string {
    const symbol = currency === 'ILS' ? '₪' : currency;
    return `${amount < 0 ? '-' : ''}${symbol}${Math.abs(amount).toFixed(2)}`;
  }

  const inputClass = 'bg-white/5 border border-white/10 text-slate-300 placeholder-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/40';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className={`flex-1 min-w-40 ${inputClass}`}
        />
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1); }}
          className={inputClass}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={account}
          onChange={e => { setAccount(e.target.value); setPage(1); }}
          className={inputClass}
        >
          <option value="">All Accounts</option>
          <option value="visa_cal">Visa Cal</option>
          <option value="max">Max</option>
          <option value="leumi_bank">Leumi Bank</option>
        </select>
        <input
          type="date"
          value={from}
          onChange={e => { setFrom(e.target.value); setPage(1); }}
          className={inputClass}
        />
        <input
          type="date"
          value={to}
          onChange={e => { setTo(e.target.value); setPage(1); }}
          className={inputClass}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-sm">
          <thead className="border-b border-white/5">
            <tr>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
              <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account</th>
              <th className="px-2 sm:px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-600">Loading...</td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-600">No transactions found</td>
              </tr>
            ) : transactions.map(tx => {
              const style = CATEGORY_STYLES[tx.category] ?? CATEGORY_STYLES.Other;
              return (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-2 sm:px-4 py-3 text-slate-500 whitespace-nowrap font-mono text-xs">
                    <span className="sm:hidden">{tx.date.slice(5)}</span>
                    <span className="hidden sm:inline">{tx.date}</span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-slate-200 max-w-28 sm:max-w-xs truncate">{tx.description}</td>
                  <td className="hidden sm:table-cell px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                      {style.icon} {tx.category}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-slate-500 text-xs">{ACCOUNT_LABELS[tx.account_id] ?? tx.account_id}</td>
                  <td className={`px-2 sm:px-4 py-3 text-right font-semibold whitespace-nowrap ${tx.amount < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {formatAmount(tx.amount, tx.currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{total} transactions</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              &larr;
            </button>
            <span className="px-3 py-1.5">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
