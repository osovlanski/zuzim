# Architecture

The Next.js application combines UI and server routes. `src/proxy.ts` gates nearly all routes with optional Basic Auth. API handlers synchronously query SQLite for transactions, summaries, insights and balances; a POST handler dynamically loads bank scrapers. `scripts/scrape.ts` supports scheduled collection and Telegram delivery. Categorization is deterministic keyword mapping. Market quotes are fetched from Yahoo and cached by Next revalidation.

The deployment is intentionally single-node because the SQLite database resides beside the app and must be shared with cron. This is acceptable for a personal tool if backups, locking and fail-closed production configuration are explicit. Do not introduce distributed services until reliability needs justify them.

Graphify: 213 nodes/256 edges.
