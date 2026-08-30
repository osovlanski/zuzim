# Zuzim

A private, local-first dashboard for Israeli card and bank transactions. Zuzim imports Visa CAL,
Max and Leumi activity into SQLite, categorizes spending, shows balances and trends, and can send a
daily Telegram summary.

## Local development

Use Node 22.22.2 or newer, then create a private local environment file:

```bash
cp .env.local.example .env.local
npm ci
npm test
npm run dev
```

Open <http://localhost:3000>. Local development may omit `APP_USER`/`APP_PASSWORD`. Production
fails closed when either is missing. `CRON_SECRET` is always required for `/api/daily-summary` and
is accepted only as a Bearer header.

## Verification

```bash
npm test
npm run lint
npm run build
npm audit --omit=dev
```

The bank scraper requires Node 22.22.2 or newer. Remaining high-severity audit findings are
transitive browser/scraper dependencies; CI blocks newly introduced critical findings.

## Encrypted backups

Set `BACKUP_ENCRYPTION_KEY` to a long, unique passphrase and optionally set `BACKUP_DIR` and
`ZUZIM_DB_PATH`:

```bash
npm run backup
npm run backup:verify -- /path/to/zuzim-<timestamp>.sqlite.enc
```

Backups use AES-256-GCM and owner-only permissions. Keep the passphrase separate from backups and
periodically verify a restore.

## Deploy on Railway

The local SQLite file requires persistent disk; Vercel's serverless filesystem is unsuitable.

1. Create a Railway project from this repository (`npm run build`, then `npm run start`).
2. Attach a persistent volume where `ZUZIM_DB_PATH` points.
3. Configure `APP_USER`, `APP_PASSWORD`, `CRON_SECRET`, `BACKUP_ENCRYPTION_KEY`, and the required
   scraper/Telegram credentials from `.env.local.example`.
4. Run `npm run scrape` on a scheduled service that mounts the same volume.
5. Schedule `npm run backup`, store encrypted backups off-volume, and verify restores regularly.
6. Install the PWA from a mobile browser using “Add to Home Screen”.

## Explicit non-goals and limitations

- No stock buy/sell signals or automated trading actions.
- The scraper does not provide an in-app Leumi OTP flow; accounts requiring interactive OTP fail
  visibly in account sync health.
- Zuzim is single-user and single-instance. It is not a multi-tenant finance service.
