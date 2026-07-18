This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Railway

This app stores data in a local SQLite file (`zuzim.db`), so it needs persistent disk — Railway's
volumes work, Vercel's serverless filesystem does not.

1. Create a Railway project from this repo (Nixpacks auto-detects Next.js; build = `npm run build`, start = `npm run start`).
2. Attach a persistent volume mounted where the app runs (e.g. `/app`) so `zuzim.db` survives deploys.
3. Set environment variables from `.env.local.example` — at minimum `APP_USER` / `APP_PASSWORD`
   (HTTP Basic Auth gate, required once the app is reachable from the internet) and whichever
   scraper credentials you use (`VISA_CAL_*`, `MAX_*`, `LEUMI_*`).
4. For the daily scrape + Telegram summary, add a Railway Cron Job service running
   `npm run scrape` on a schedule (e.g. `0 20 * * *`), pointed at the same volume.
5. Open the app from your phone browser and use "Add to Home Screen" — it's a PWA
   (`public/manifest.json`), so it installs like a native app icon.

## Not built here (flagged, not silently skipped)

- **Stock buy/sell signals** — scope was set to price/trend data only; no automated trading calls.
- **Leumi OTP handling** — `israeli-bank-scrapers`'s Leumi module has no OTP hook in the installed
  version. If the bank forces SMS verification on that login, the scrape just errors out; there's
  no in-app way to complete it.
