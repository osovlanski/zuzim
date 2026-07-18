'use client';

import { useState } from 'react';

interface ScrapeButtonProps {
  onScrapeComplete?: () => void;
}

export default function ScrapeButton({ onScrapeComplete }: ScrapeButtonProps) {
  const [isScraping, setIsScraping] = useState(false);
  const [lastResult, setLastResult] = useState<{ scraped: number; errors: string[] } | null>(null);

  async function handleScrape() {
    setIsScraping(true);
    setLastResult(null);
    try {
      const response = await fetch('/api/scrape', { method: 'POST' });
      const data = await response.json();
      setLastResult(data);
      onScrapeComplete?.();
    } catch (err) {
      setLastResult({ scraped: 0, errors: [err instanceof Error ? err.message : 'Network error'] });
    } finally {
      setIsScraping(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleScrape}
        disabled={isScraping}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
      >
        <svg
          className={`w-4 h-4 ${isScraping ? 'animate-spin-icon' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.13-3.36M20 15a9 9 0 01-14.13 3.36" />
        </svg>
        {isScraping ? 'Syncing...' : 'Sync'}
      </button>
      {lastResult && (
        <span className={`text-xs ${lastResult.errors.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
          {lastResult.errors.length > 0
            ? lastResult.errors[0]
            : `+${lastResult.scraped} saved`}
        </span>
      )}
    </div>
  );
}
