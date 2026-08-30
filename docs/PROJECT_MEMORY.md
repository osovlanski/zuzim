# Project Memory

Zuzim is a single-user personal finance PWA for Israeli card/bank accounts. It scrapes Visa CAL, Max and Leumi, stores balances/transactions locally, categorizes spending, shows summaries/insights/stocks, and sends Telegram summaries.

- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind 4, Recharts.
- Backend/persistence: Next route handlers plus synchronous better-sqlite3 in `src/lib/db.ts`; local `zuzim.db` requires a persistent volume.
- Entry points: `src/app/page.tsx`, `src/app/api/*/route.ts`, `src/proxy.ts`, `scripts/scrape.ts`.
- Integrations: `israeli-bank-scrapers`, Yahoo Finance chart endpoint, Telegram.
- Deploy: Railway persistent-volume deployment and cron; PWA manifest; GitHub CI runs tests, lint, build and a critical dependency gate.
- Auth: Basic Auth may be omitted only in development; production fails closed. `CRON_SECRET` is mandatory and accepted only through a Bearer header.
- Tests: Node/tsx tests cover security, filters, migrations, scrape-health privacy and backup cryptography. Tests, lint and production build were green on 2026-08-29.
- State: functional personal prototype with versioned SQLite migrations, WAL/busy timeout, bounded API filters, account sync health and encrypted backup/restore verification.
- Weaknesses: SQLite remains single-instance; bank/browser dependencies retain high transitive advisories; unofficial market-data dependency; stored scraper errors need a retention policy.
- Portfolio: independent end-user finance tool; little platform overlap beyond generic scheduling/observability.
- Open questions: backup/recovery and retention; production topology; scraper ToS/stability; whether bank MFA makes Leumi reliable.
