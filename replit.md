# Workspace Hub

A monorepo containing two full-stack web apps: Notion Hub (page explorer) and Mail (Outlook-style email client), sharing a common PostgreSQL backend and API server.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

| Layer | Path | Description |
|-------|------|-------------|
| API Server | `artifacts/api-server/` | Express 5 backend, OpenAPI-first, serves both apps |
| Notion Hub | `artifacts/notion-hub/` | Vite React app — Notion page explorer |
| Mail App | `artifacts/mail-app/` | Vite React app — Inbox, Calendar, Contacts, Compose, Settings |
| Mockup Sandbox | `artifacts/mockup-sandbox/` | Canvas component preview server |
| DB Schema | `lib/db/src/schema/` | Drizzle ORM schemas (mail.ts, notion.ts) |
| API Spec | `lib/api-spec/openapi.yaml` | OpenAPI contract → Orval generates hooks + Zod |
| Shared UI | `lib/ui/` | shadcn/ui components + Tailwind theme |
| API Client | `lib/api-client-react/` | Orval-generated React Query hooks & Zod schemas |

## Architecture decisions

- **OpenAPI-first**: All endpoints are defined in `lib/api-spec/openapi.yaml` first; Orval generates React Query hooks and Zod schemas. This keeps frontend and backend in sync automatically.
- **Date serialization**: Drizzle `timestamp` returns `Date` objects, but OpenAPI/Zod expects ISO strings. All mail route responses explicitly call `.toISOString()` before `zod.parse()` — a gotcha if forgotten.
- **Orval query keys**: Generated `useGet*` hooks require `queryKey` in options or TypeScript throws `TS2741`. Always include it when calling generated query hooks.
- **Monorepo routing**: Each artifact registers a `previewPath` (e.g. `/mail/`, `/notion/`) via Replit's artifact system. The shared proxy routes by path prefix.

## Product

- **Notion Hub** — Browse and view Notion pages via the Notion API (requires `NOTION_API_KEY`)
- **Mail App** — Full email client with:
  - **Inbox**: Three-pane Outlook-style layout (folders, email list, reader pane)
  - **Compose**: New email composer with contact autocomplete
  - **Calendar**: Weekly event list with location, attendees, duration
  - **Contacts**: Searchable directory with add/delete
  - **Settings**: Account, notifications, privacy, appearance preferences

## User preferences

- Push entire project to GitHub so Claude Code (or other agents) can pull it
- Keep `replit.md` up to date as a master spec / project index

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
