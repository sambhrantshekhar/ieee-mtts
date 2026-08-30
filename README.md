# IEEE MTT-S Recruitment Platform

Full-stack recruitment website for the IEEE MTT-S university student chapter.
Students sign up, log in, and apply to one of four departments: **Technical,
Design, Management, and Social**.

## Tech Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4** + **shadcn/ui** components
- **React Hook Form** + **Zod** (validation)
- **PocketBase** (backend, database & auth) + official JS SDK
- **Sonner** (toasts), **Lucide** (icons)
- Package manager: **bun**

## Prerequisites

- [bun](https://bun.sh) ≥ 1.1
- [Docker](https://www.docker.com/) (to run PocketBase)
- Node.js ≥ 20

## Getting Started

### Option A — Everything in Docker (PocketBase + web app)

```bash
cp .env.example .env        # fill in PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD
docker compose up -d --build
```

- App: http://localhost:3000
- PocketBase Admin UI: http://127.0.0.1:8090/_/

On startup the app **auto-creates any missing collections** (`users.reg_number`,
`questions`, `applications`) and seeds the default department questions using
the superuser credentials in `.env`. The `web` service waits for PocketBase to
be healthy before starting.

Create the superuser **once** in the Admin UI
(`http://127.0.0.1:8090/_/`) before first run, then fill `PB_ADMIN_EMAIL` /
`PB_ADMIN_PASSWORD` in `.env`.

### Option B — PocketBase in Docker, Next.js locally (dev)

```bash
docker compose up -d pocketbase      # PocketBase only, on :8090

bun install
cp .env.example .env      # adjust NEXT_PUBLIC_PB_URL + PB_ADMIN_* if needed
bun run dev               # http://localhost:3000
```

> The schema bootstrap runs on server start (`src/instrumentation.ts`). In
> Option B the server reaches PocketBase via `NEXT_PUBLIC_PB_URL`; in Docker it
> uses the internal `PB_URL=http://pocketbase:8090`.

## Database Schema

The schema is **auto-managed**: on startup the server logs in as the superuser
(from `PB_ADMIN_EMAIL` / `PB_ADMIN_PASSWORD`) and creates anything missing.
All operations are idempotent — nothing is overwritten or deleted.

For manual setup, here is what the bootstrap creates:

### Collection 1: `users` (built-in auth collection)

PocketBase ships with the `users` auth collection. The bootstrap adds one field:

| Field | Type | Options |
|-------|------|---------|
| `reg_number` | Text | **Required** ✓ · Max: `16` · Pattern: `^[0-9]{2}[A-Z]{3}[0-9]{4}$` |

**API rules:** keep the defaults — the **Create** rule must be blank so
unauthenticated visitors can register.

### Collection 2: `questions` (drives the application forms)

The apply forms render **whatever questions exist in this collection** for the
selected department — add, edit, or remove questions in the Admin UI and the
forms update automatically. One question per answer key:

| Field | Type | Options |
|-------|------|---------|
| `department` | Select | `technical,design,management,social` · **Required** ✓ |
| `key` | Text | **Required** ✓ · Max: `64` (answer key stored in `data`, e.g. `github`) |
| `label` | Text | **Required** ✓ · Max: `255` |
| `type` | Select | `text,url,textarea,select,file` · **Required** ✓ |
| `placeholder` | Text | Max: `255` |
| `hint` | Text | Max: `500` |
| `options` | JSON | Array of options for `select` questions |
| `rows` | Number | Textarea height |
| `min_length` | Number | Min characters for `text`/`textarea` |
| `required` | Bool | Default `true` |
| `sort_order` | Number | Lower = rendered first |

Unique index: `(department, key)`. API rules: **List/View** =
`@request.auth.id != ""` (logged-in users only); **Create/Update/Delete** =
blank (superuser only).

### Collection 3: `applications` (regular collection)

| Field | Type | Options |
|-------|------|---------|
| `user` | Relation | Target: **users** · Max select: `1` · Cascade delete: ✓ |
| `department` | Select | Values: `technical,design,management,social` (comma-separated) · **Required** ✓ |
| `status` | Select | Values: `pending,reviewed,accepted,rejected` · Default: `pending` |
| `data` | JSON | Max size: default (200000) |
| `portfolio_asset` | File | **Optional** · Allowed: `png,jpg,jpeg,svg,pdf` · Max size: `5242880` (5 MB) · Max select: `1` |
| `user_department` | Text | **Required** ✓ · Max: `64` · **Unique** ✓ |

> `user_department` is set by the app to `"<userId>_<department>"` and its
> unique index is what guarantees a student can't apply to the same department
> twice.

**API rules** — restrict every operation to the record owner:

| Operation | Rule |
|-----------|------|
| List | `user.id = @request.auth.id` |
| View | `user.id = @request.auth.id` |
| Create | `user.id = @request.auth.id` |
| Update | `user.id = @request.auth.id` |
| Delete | `user.id = @request.auth.id` |

> The `user.id = @request.auth.id` create rule also enforces that users can only
> submit applications that reference their own account.

### How the `data` field is populated

Answers are stored as a JSON object keyed by each question's `key`, e.g.:

```json
{
  "github": "https://github.com/you",
  "stack": "Next.js",
  "bug": "I once spent three days chasing a race condition in an event loop…"
}
```

The keys are whatever exists in the `questions` collection — so they follow
whatever you configure there. The seeded defaults are:

- **Technical:** `github`, `stack`, `bug`
- **Design:** `portfolio`, `software` (+ `asset` file → `portfolio_asset`)
- **Management:** `scenario`, `leadership`
- **Social:** `handles`, `pitch`

## How Authentication Works

- The PocketBase SDK keeps the session token in **localStorage** (`pb_auth`)
  via its `LocalAuthStore`. A singleton client is exposed by
  `src/lib/pocketbase.ts`.
- `AuthProvider` (`src/components/auth-provider.tsx`) restores the session on
  mount and calls `authRefresh()` to validate/refresh it against PocketBase.
- Protected routes (`/departments`, `/dashboard`, `/apply/[department]`) live
  in the `(protected)` route group whose layout wraps them in `RequireAuth`. It
  redirects unauthenticated users to `/auth/login`.
- Auth pages are in the `(auth)` route group and are publicly accessible.

## Project Structure

```
src/
  app/
    page.tsx                    # Hero-only landing page
    instrumentation.ts          # Runs schema bootstrap on server start
    (auth)/                     # Public auth group
      auth/login/page.tsx
      auth/signup/page.tsx
    (protected)/                # Protected group (RequireAuth layout)
      departments/page.tsx      # Department selection
      dashboard/page.tsx        # Application status monitor
      apply/[department]/page.tsx
  components/
    auth-provider.tsx           # Session context (login/signup/logout)
    require-auth.tsx            # Route guard
    navbar.tsx, theme-toggle.tsx
    department-card.tsx, status-badge.tsx
    apply-form.tsx              # Dynamic form driven by the questions collection
    spectrum-window.tsx, rf-wave.tsx, cyber-background.tsx, ...
    ui/                         # shadcn/ui primitives
  lib/
    pocketbase.ts               # PocketBase client (client/server aware)
    bootstrap.ts                # Auto-create collections + seed questions
    questions.ts                # Fetch questions per department
    departments.ts              # Department metadata (names, icons, colors)
    applications.ts             # Application fetch/submit helpers
    errors.ts                   # PocketBase error → readable message
```

## Troubleshooting

- **"Could not reach the server"** → PocketBase isn't running
  (`docker compose up -d`) or `NEXT_PUBLIC_PB_URL` points to the wrong URL.
- **"A user with this email already exists"** → the email is taken; the
  signup form surfaces PocketBase's field errors via toast.
- **Applying to the same department twice** → blocked by the `user_department`
  unique index; the apply page shows an "already applied" state.
- **CORS errors in the browser** → PocketBase allows all origins by default.
  If you changed its `--origins` flag, allow `http://localhost:3000`.