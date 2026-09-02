<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes; APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev`; verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Codebase Preview Reminder

> [!IMPORTANT]
> **READ BEFORE WRITING CODE**: This file is the authoritative source for project state, architecture, design system, and execution rules. Skim the full file before starting work. If a statement here conflicts with your training data, this file wins.

# Brand naming

- The project is the official website of **Paguyuban Mojang Jajaka Kabupaten Garut** (PAMOKA Garut).
- Use **PAMOKA Garut** for the site title and formal references; use **MOKA Garut** for the product/consumer-facing brand (footer, socials, metadata template `%s | MOKA Garut`). Never invent other spellings.
- The flagship event is the **Pasanggiri Mojang Jajaka Kabupaten Garut**. Keep the Sundanese tagline as brand copy: **Nu Nyunda Tur Nyakola**.
- Participant categories are fixed codes `JD`, `MD`, `JR`, `MR` (see `categoryValues` in `src/server/db/schema.ts`); they are rendered with their abbreviated label, never invented names.
- Social handles and hashtags are brand copy: `@mokagarut`, `#nyundaturnyakola`, `#kayakarya`.

# Design system

The design reference is the **public site** (`src/app/*` pages plus `src/components/custom/*` and `src/components/*`). The admin CMS surfaces are **NOT** the design reference; when you touch admin UI, reuse the existing admin primitives but steer the styling toward the public system. Do not treat the current admin look (slate-heavy, pill badges, deep shadows) as canonical.

Authoritative tokens live in `src/app/globals.css` (`@theme inline`, `:root`, `.dark`, `@layer base`). Prefer the semantic Tailwind utilities below over hard-coded hex or ad hoc font stacks.

## Font families

| Role | Font | Tailwind | Notes |
|------|------|----------|-------|
| **Headings & brand titles** | **Montserrat** (weights 400-800) | `font-montserrat` | Section headings, hero titles, card titles, page headers. Loaded in `src/style/font.ts`. |
| **Body, UI, captions** | **Inter** (weights 400-800) | `font-inter` | Default on `body` (set in `src/app/layout.tsx`). Paragraphs, nav, footer, form text. |

`next/font` exposes `--font-montserrat-next` and `--font-inter-next`; `@theme` maps `font-montserrat` / `font-inter` to those variables. The `--font-geist-*` tokens in `@theme` are unused defaults; do not rely on them.

## Typography (public)

Use the shared `typography` object from `@/components/custom/typography` for public copy. It is the canonical set, not a suggestion:

| Export | Renders | Base classes | Use |
|--------|---------|--------------|-----|
| `typography.t1` | `h3` | `uppercase text-fb-400 font-montserrat text-base font-bold` | Eyebrow / section label above a heading. |
| `typography.h1` | `h2` | `text-4xl font-semibold font-montserrat` | Section heading. Override size to `text-3xl md:text-5xl` and color to `text-white` on photo sections. |
| `typography.p` | `p` | `text-base font-normal font-montserrat text-[#505050]` | Body copy. `text-justify` and `text-[#505050]` are the established body look. |

Rules:
- Headings are Montserrat; never use Inter for a title and never use `text-gray-900`-style ad hoc heading colors on the public site.
- On dark photo heroes use `text-white` and muted `text-[#ddd]` / `text-white/80`; on light sections use `#505050` body text.
- Body text is left-aligned by default; use `text-justify` only where the design already does.

## Color

Tailwind maps each `--color-*` token to utilities: `text-{name}`, `bg-{name}`, `border-{name}`, and so on.

### Brand palettes (the identity; use first)

| Utility | Role |
|---------|------|
| `dgb`, `dgb-50` … `dgb-900` | Deep green primary. `bg-dgb` for primary buttons and CTAs; `text-dgb-900` for headings; `bg-dgb-50` for soft fills; `to-dgb-800` for hero vignettes. |
| `fb`, `fb-50` … `fb-900` | Firebrand orange accent. `text-fb-400`/`text-fb-500` for eyebrows; `text-fb` for inline highlights; `bg-fb` / `from-fb via-fb-200` for brand strips. |

### Semantic UI (shadcn) ; use for base surfaces

These adapt in light/dark via `:root` / `.dark` and are defined in `globals.css`. The default shadcn `primary` is neutral (near-black), so brand CTAs use `bg-dgb` explicitly rather than `bg-primary`.

| Token / utility | Use |
|-----------------|-----|
| `bg-background` / `text-foreground` | Page surface and primary text. |
| `bg-card` / `text-card-foreground` | Cards and elevated panels. |
| `bg-muted` / `text-muted-foreground` | Subtle fills; de-emphasized text. |
| `bg-secondary` / `text-secondary-foreground` | Secondary surfaces. |
| `border-border` | Default borders and dividers. |
| `bg-input` / `border-input` | Form fields. |
| `text-destructive` / destructive buttons | Errors and destructive actions. |
| `chart-1` … `chart-5` | Recharts series (mapped in theme). |

## Buttons

Public CTAs use `@/components/custom/button` (`rounded-md`, white text). Do not restyle buttons inline.

| Variant | Classes | Use |
|---------|---------|-----|
| `default` | `bg-dgb hover:bg-dgb/90 disabled:bg-dgb-600` | Primary action. |
| `outline` | `border border-dgb bg-transparent hover:bg-dgb hover:text-white` | Secondary action on light surfaces. |
| `destructive` | `bg-destructive` | Destructive action. |

Sizes: `sm` (h-8), `default` (h-9), `lg` (h-10). For links styled as buttons, wrap the custom `Button` in a `Link`.

## Imagery & backgrounds

- Use `next/image` with explicit `width`/`height` (or `fill` inside a sized box) and `object-cover`. Never use plain `<img>` for site assets.
- Full-bleed hero sections: `bg-[url(/asset.webp)] bg-cover bg-center` on the `<section>`, with a radial vignette overlay: `bg-radial-[at_50%_50%] from-transparent to-90% to-dgb-800` (fixed, `pointer-events-none`, `z-0`).
- Legibility washes over photo sections: `bg-dgb-50/90` or `bg-fb-50/90` full-section overlays behind content. Use the `Section` component (`background` + `overlay`) for this pattern.
- `BG` (`@/components/next-image-bg`) is the reusable fixed site-texture background; `HeroVideo` + `HeroTextWrapper` (`@/components/custom/hero-video`, `@/components/custom/hero-text`) are the video-hero pattern with a poster fallback; `ImageMaskFade` (`@/components/custom/image-mask`) is the masked edge image.
- Prefer the established organic crops (`rounded-lg`, `rounded-b-full`, `rounded-t-full`, `rounded-full` circles) for creative compositions; do not invent new shapes.

## Layout & motion

- Mobile-first single column: `flex-col` / `grid-cols-1` under `sm:`, switch with `md:` breakpoints (`max-sm:` for mobile-only overrides). Test at 380px.
- Section rhythm: use the `Section` component (full-bleed, `px-8 md:px-20` / `py-12 md:py-20`, optional `background` + `overlay`); keep existing `min-h-screen` hero rhythm on the homepage.
- Footer: `bg-linear-to-br from-dgb to-fb` with `text-white` content and a `Separator`.
- Animation: `motion/react` (not `framer-motion`) and Lenis smooth scroll (`@/components/lenis`). Hover transitions use `transition-all`/`transition-colors` with short durations (e.g. `duration-500`, `group-hover:scale-102`); entrance uses the `animate-fade-in` keyframes in `globals.css`.
- Icons: `lucide-react`, `size-4` default.

## Radius

- Interactive elements and buttons: `rounded-md`.
- Media: `rounded-lg`; cards/surfaces: `rounded-xl`.
- `rounded-full` is allowed for circles, dots, and the site's organic circular compositions, not for elongated pills.

## Language & copy

- UI copy is **Bahasa Indonesia**, short labels, sentence case (e.g. `Batal`, `Lanjut`, `Selengkapnya`, `Geser untuk melihat berita lain`).
- Sundanese brand phrases (`Nu Nyunda Tur Nyakola`, `Ulin Ngaprak Garut`, and so on) are kept verbatim.
- Numbers over sentences; no exclamation marks, no filler, no em/en dashes.

---

## No Em/En Dashes

- Never use em dashes or en dashes (long hyphen characters) in any file. Use `;`, `,`, or `.` instead. This applies to code comments, UI copy, metadata descriptions, and documentation.

---

## Date & Time Handling

All timestamps are stored as **integer epoch milliseconds** with Drizzle `{ mode: "timestamp_ms" }`. Drizzle maps those columns to and from JS `Date` objects automatically; never treat them as seconds and never re-invent a converter.

### Rules

1. **Schema timestamps**: use `integer(..., { mode: "timestamp_ms" })` for `createdAt`/`updatedAt` and any instant. The shared `timestamps` helper in `src/server/db/schema.ts` is the pattern; reuse it.
2. **Day-granularity text columns**: `voteDailyTallies.localDate` stores a `yyyy-MM-dd` string (validated by `/^\d{4}-\d{2}-\d{2}$/`). Generate and validate it with that exact format; do not hand-roll a different date string.
3. **Timezones**: `edition.timezone` and `votingCampaign.timezone` default to `Asia/Jakarta` (WIB, `+07:00`). For WIB deadlines use explicit offset literals, e.g. `new Date("2025-08-09T23:59:59+07:00")` (see `src/proxy.ts` and `src/components/navbar.tsx`). Never assume the server clock is WIB.
4. **Display formatting**: use `Date.prototype.toLocaleDateString("en-US", ...)` with an uppercase month for badge dates (pattern in `src/lib/metadata-fetcher.ts` and `getBadgeInfo` in `src/components/news-card.tsx`).
5. **Hydration safety**: the root `<html>` already uses `suppressHydrationWarning`. Keep server and client date rendering identical so the UI never flashes a different date.
6. **Deterministic tests**: pass explicit `Date` values (or `now` injection, see `src/server/db/mutations.ts`) instead of calling `new Date()` inside tested code paths.

---

## Media & Uploads

All uploads go through **UploadThing** only. There is no R2, S3, or local-blob write path. Do not add one.

- Client helpers: `src/lib/uploadthing.ts`; server config: `src/app/api/uploadthing/core.ts`.
- Limits are finite policy constants in `src/server/media/policy.ts`, never inline and never unlimited:
  - Images: 32 MB route cap, 20 MB application-level cap, max 10 files.
  - Video: 512 MB, max 1 file.
  - PDF: 64 MB, max 5 files.
- Every upload creates a `mediaAsset` row (`provider`, `url`, `filename`, `mimeType`, `bytes`, `alt`, `decorative`, `ownerUserId`).
- Fill `alt` for informative images; mark purely decorative assets `decorative: true`. Reuse the same asset across content instead of re-uploading.
- Uploads and media mutations are authenticated and go through server actions with permission checks and audit; never expose an unauthenticated upload endpoint.
- Do not upload personal data, credentials, or documents that should stay private.

---

## Execution Rules

1. Before DB or env work, read `src/server/db/schema.ts` and `src/env.js` for the current schema and env state.
2. Schema changes: edit `src/server/db/schema.ts` only, then `npm.cmd run db:generate`, review the generated SQL in `drizzle/`, run `npm.cmd run db:check`. Apply with `npm.cmd run db:migrate` only to the explicitly chosen target (`DRIZZLE_DATABASE_URL` / `DRIZZLE_AUTH_TOKEN` are separate from the app env). Never `drizzle-kit push`, never hand-edit `drizzle/`, never run production migrations without authorization.
3. After every meaningful edit batch: `npm.cmd run verify` (db tests, Next type generation, typecheck, lint, production build) or at least `npm.cmd run lint` + `npm.cmd run typecheck`. All must pass with zero new errors. Do not invent other lint/build commands.
4. Every write is a server action with `requirePermission(...)` from `src/server/auth/authorization.ts` plus `appendAuditLog` inside the same database transaction (`src/server/auth/audit.ts`). Hidden UI controls, client checks, or a redirect are never proof of authorization.
5. Follow the plans programme in `plans/README.md`. Read the full plan plus its dependencies, restate the in-scope files and STOP conditions, update the status row to `IN PROGRESS`, and run the drift check against baseline commit `3874ede` before editing.
6. No production migration, super-admin promotion, upload, deploy, or public cutover without the operator's explicit authorization for that exact action and target. Follow the runbooks in `docs/runbooks/`.
7. The public site is currently the source of truth (hard-coded content). Database content is exercised through the admin preview/staging flow until Plan 010 cutover is authorized. Do not wire public routes to live CMS data ahead of that.
8. UI copy: Bahasa Indonesia, short labels, sentence case, numbers over sentences. No exclamation marks, no filler, no em/en dashes.
9. **Auto-update docs**: every time you add a feature, table, env var, or change core architecture, update the relevant docs:
   - `docs/admin-guide-id.md` for user-facing admin workflows
   - `docs/runbooks/*` for manual operator procedures
   - `plans/README.md` for plan status and architecture decisions
   - `AGENTS.md` Project State section for completed/blocked items
   Scan `docs/` and `plans/` for any file made inaccurate by the change and update it.

---

## Project State

### Plans (authoritative status lives in `plans/README.md`)

| Plan | Title | Status |
|------|-------|--------|
| 001 | Replace PostgreSQL and Prisma with Turso and Drizzle | DONE |
| 002 | Restore the verification baseline and upgrade to Next.js 16.2.12 | DONE |
| 003 | Add Google OAuth, access requests, and granular RBAC | DONE |
| 004 | Add annual CMS data models, revisions, and transactional audit logs | DONE |
| 005 | Build the reusable admin shell, dashboard, users, profile, and audit UI | DONE |
| 006 | Add the media library with authenticated UploadThing uploads | DONE |
| 007 | Move global, home, news, sponsor, and organization content into the CMS | IN PROGRESS |
| 008 | Move editions, participants, events, carousels, and galleries into the CMS | IN PROGRESS |
| 009 | Make voting campaigns, tallies, visibility, and results manageable | IN PROGRESS |
| 010 | Import 2025 content, run end-to-end QA, and perform a reversible cutover | IN PROGRESS (not authorized) |
| 011 | Unify public and admin design, media navigation, and annual CMS context | IN PROGRESS |

### Verified / working

- Turso (libSQL) + Drizzle data layer with the seed of 44 finalists and 572 zero-income daily rows over 13 dates (`npm.cmd run db:seed`; refuses non-seed databases).
- Better Auth Google login with pending access requests, composable roles, permission overrides, and transactional audit. No automatic super-admin bootstrap; the first super admin is promoted manually in Turso per `docs/runbooks/bootstrap-super-admin.md`.
- Admin shell with permission-filtered navigation (`/admin`), content editors, media library, users, and audit pages. Voting uses an annual campaign workspace, finalis-only edition isolation, per-participant QRIS media, manual daily merchant aggregates, optimistic tally updates, and transactional audit.
- Public routes: `/`, `/tentang`, `/rangkaian-kegiatan`, `/voting`, `/profil-finalis`, `/voting/hasil`, `/monitor` (auth-gated voting viewer). `/voting/*` is gated by the deadline in `src/proxy.ts`.
- Plan 011 is complete locally: the established public presentation remains hard-coded and is the visual source of truth, while admin uses its backgrounds, vignette, translucent surfaces, typography, and brand palette. CMS context and persisted media folders are retained. Migration `0004` is generated but not applied to any target.
- Baseline commit for the plans drift check: `3874ede`.

### Blockers

- Plan 010 cutover (public runtime switch to CMS data) is intentionally deferred until the operator authorizes it. Until then the hard-coded site stays live.

---

## Core Architectural Stack

- **Framework**: Next.js 16 (App Router) under `src/`, React 19, TypeScript, Tailwind CSS v4 (`@theme inline`, `@custom-variant dark`). App code lives in `src/app`, `src/components`, `src/lib`, `src/server`.
- **Database**: Turso (libSQL) with Drizzle ORM. DB access via `src/server/db/client.ts` (`database`), queries in `src/server/db/queries.ts`, mutations in `src/server/db/mutations.ts`, schema in `src/server/db/schema.ts`. PostgreSQL and Prisma were removed in Plan 001; never reintroduce them.
- **Auth**: Better Auth 1.6.x with Google OAuth (`src/server/auth/config.ts`), roles and permission overrides in `src/server/auth/permissions.ts`, authorization boundary in `src/server/auth/authorization.ts`, immutable audit in `src/server/auth/audit.ts`. No email/password provider.
- **Media**: UploadThing (`src/app/api/uploadthing`), policy in `src/server/media/policy.ts`.
- **CMS domain**: editions, categories, participants, events, galleries, news, sponsors, people, page sections, content drafts/revisions, voting campaigns and daily tallies, plus auth/audit tables. All in `src/server/db/schema.ts`.
- **Env**: `src/env.js` (server-only `TURSO_*`, `BETTER_AUTH_*`, `GOOGLE_*`, `BASE_URL`). There are no `FEATURE_*` flags; do not invent a feature-flag system.
- **UI**: radix primitives + shadcn-style components in `src/components/ui`, custom brand components in `src/components/custom`, lucide-react icons, `motion` + Lenis for animation, recharts for charts, sonner for toasts.
- **Commands**: npm (not bun). See the scripts table in `package.json` (`dev`, `verify`, `db:generate`, `db:check`, `db:migrate`, `db:seed`, `db:inspect`, `cms:*`).

---

## UI Primitives & Layout

### Public primitives

| Need | Use | Import |
|---|---|---|
| Headings / body copy | `typography.t1`, `typography.h1`, `typography.p` | `components/custom/typography` |
| Section shell / full-bleed background + overlay | `Section`, `Vignette` | `components/custom/section` |
| Section eyebrow + title + description | `SectionHeader` | `components/custom/section-header` |
| Finalis card grid | `FinalistCard` | `components/custom/finalist-card` |
| Video hero (poster fallback) | `HeroVideo` | `components/custom/hero-video` |
| Hero text fade-in wrapper | `HeroTextWrapper` | `components/custom/hero-text` |
| Masked edge image | `ImageMaskFade` | `components/custom/image-mask` |
| Buttons | `Button` (custom; `rounded-md`) | `components/custom/button` |
| Background texture | `BG` | `components/next-image-bg` |
| Modals / confirms | `AlertDialog` | `components/ui/alert-dialog` |
| Side panels | `Sheet` | `components/ui/sheet` |
| Selects / inputs | `Select`, `Input`, `Textarea`, `ScrollArea` | `components/ui/*` |
| Cards | `Card` | `components/ui/card` |
| Carousel | `Carousel` (embla) | `components/ui/carousel` |
| Tables | `Table` family | `components/ui/table` |
| Toasts | `Toaster` (sonner) | `components/ui/sonner` |
| Accordion / popover | `Accordion`, `Popover` | `components/ui/*` |
| Icons | lucide-react, default `size-4` | `lucide-react` |

### CMS primitives (reuse, but not the design reference)

`src/components/admin/primitives.tsx` provides the shared building blocks for the admin: `AdminPage`, `AdminCard`, `AdminCardHeader`, `AdminField`, `AdminInput` / `AdminSelect` / `AdminTextarea`, `AdminButton` / `AdminLinkButton`, `AdminBadge`, `AdminStatCard`, `AdminEmptyState`, `AdminListRow`. The admin shell lives in `src/components/admin/admin-shell.tsx`.

Rules for admin work:
- Compose from these primitives instead of hand-rolling per-page markup; a lint-clean file does not excuse duplication.
- Do not copy the current admin styling (slate-heavy backgrounds, `rounded-full` status pills, strong card shadows) into new UI. The public site is the design reference; align new admin UI with Montserrat headings, `dgb`/`fb` brand colors, `rounded-md`/`rounded-xl`, and the shared semantic tokens.
- Keep dialog/form shells in `components/ui/*` and radix; do not introduce a second component library.
- Server actions stay thin: permission check, validation, transaction + audit, `revalidatePath`.
