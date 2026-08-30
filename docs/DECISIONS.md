# Decisions

- Use a local SQLite file and Railway persistent volume rather than serverless storage. Supported by README and `db.ts`.
- Keep the application single-user with Basic Auth, explicitly noting it is not role-based auth. Supported by `proxy.ts`.
- Use an external scheduled scrape plus Telegram summary. Supported by README and script/routes.
- Defer automated trading signals and Leumi OTP handling. Explicitly documented in README.
- Dynamically import bank scrapers to keep Next build-time page collection working. Supported by route comments/implementation.
