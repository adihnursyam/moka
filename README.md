# Moka

Next.js application backed by Turso/libSQL and Drizzle ORM.

## Environment

Copy `.env.example` to `.env` and configure the application credentials:

```env
TURSO_DATABASE_URL=libsql://database-name-organization.turso.io
TURSO_AUTH_TOKEN=replace-with-a-database-token
```

Schema commands deliberately use separate variables so their target must be selected explicitly:

```env
DRIZZLE_DATABASE_URL=libsql://database-name-organization.turso.io
DRIZZLE_AUTH_TOKEN=replace-with-a-database-token
```

Never commit `.env`, database files, tokens, or migration reports.

## Database workflow

Generate and validate committed SQL migrations:

```powershell
npm.cmd run db:generate
npm.cmd run db:check
```

Set `DRIZZLE_DATABASE_URL` and `DRIZZLE_AUTH_TOKEN` to the intended Turso database before running `db:migrate`. Review generated SQL first; do not use `drizzle-kit push`.

The fresh-start seed creates 44 finalists and 572 zero-income daily rows over 13 dates. Semifinalists intentionally remain empty. It refuses nonempty databases unless they exactly match that seed, in which case it safely does nothing:

```powershell
npm.cmd run db:seed
```

Read-only database metadata and aggregate counts can be checked without printing credentials or rows:

```powershell
npm.cmd run db:inspect
```

## Development and verification

Development and production both use the configured Turso database. Run
`npm.cmd run auth:seed` only when the intended Turso target is configured.

```powershell
npm.cmd run dev
npm.cmd run verify
```

Verification requires Node.js 20.9 or newer. `verify` runs database tests,
Next type generation/type checking, lint, and production build sequentially.

Admin write actions must not be deployed until their separate authentication hardening is completed.
