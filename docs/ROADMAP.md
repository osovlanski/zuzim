# Roadmap

## Now

- Fail closed in production when app/cron credentials are missing; remove query-string cron secrets.
- Add database migrations, encrypted backups and restore verification.
- Add tests for auth, scraper idempotency, transaction filtering, categorization and summary date boundaries.

## Next

- Add scrape health/freshness, duplicate detection and actionable failure notifications.
- Add budgets, recurring-charge review and cash-flow forecasting grounded in imported data.
- Replace README boilerplate with accurate setup/privacy/recovery documentation.

## Later

- Optional read-only bank connector abstraction and household support only if multi-user need appears.

## Avoid

- Trading recommendations, multi-tenant SaaS, or distributed persistence before personal reliability is solved.
