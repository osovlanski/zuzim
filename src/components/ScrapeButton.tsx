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
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isScraping ? 'Scraping...' : 'Scrape Now'}
      </button>
      {lastResult && (
        <span className={`text-sm ${lastResult.errors.length > 0 ? 'text-red-500' : 'text-green-600'}`}>
          {lastResult.errors.length > 0
            ? lastResult.errors[0]
            : `${lastResult.scraped} transactions saved`}
        </span>
      )}
    </div>
  );
}
