# Correspondence -- Unified Email Client
# Project Root #23 | Shortcut: corr
# Path: C:\Users\Lenovo\workspace-hub\
# Created: 21 July 2026

---
PROJECT ROOT LABEL: Correspondence
SHORTCUT: corr
PATH: C:\Users\Lenovo\workspace-hub\
PARENT: VitalMatrix Intelligence (master, C:\Users\Lenovo\VitalMatrix\)
---

@~/.claude/CLAUDE.md

---

## PURPOSE

Unified email client connecting Gmail (OAuth2) and iCloud (IMAP) into a single
Outlook-style web interface. Full scope: read, send, labels, trash, star.

NOT a VitalMatrix clinical project root. No K-class constraints, no gates,
no D-series governance, no FLINT content. Personal/productivity tooling.

---

## STACK

- pnpm monorepo (v11.15.1)
- Express 5 API server (artifacts/api-server/) -- port 5000
- Mail App frontend (artifacts/mail-app/) -- Vite + React + wouter + TanStack Query + shadcn/ui + Tailwind v4 -- port 3000
- PostgreSQL 18 via Drizzle ORM (lib/db/)
- OpenAPI-first: lib/api-spec/openapi.yaml -> Orval generates hooks + Zod schemas
- Zod v4 (zod/v4 import path)

## EMAIL PROVIDERS

| Provider | Method | Auth | Status |
|----------|--------|------|--------|
| Gmail | Gmail API | OAuth2 (Google Cloud) | NOT STARTED -- credentials needed |
| iCloud | IMAP/SMTP | App-specific password | NOT STARTED -- password needed |

## DATABASE

- Name: workspace_hub
- Connection: postgresql://postgres:postgres@localhost:5432/workspace_hub
- Demo data seeded (will be replaced by real email data)

## LOCAL FIXES (Windows compatibility, committed 1e54627)

- pnpm-workspace.yaml: un-excluded win32-x64 native binaries
- lib/db/drizzle.config.ts: schema glob path
- artifacts/mail-app/vite.config.ts: fs.allow for workspace libs

## STARTUP

Requires env vars from .env (DATABASE_URL, SESSION_SECRET). See .env at repo root.

```bash
# API server (start first)
source .env && PORT=5000 NODE_ENV=development node artifacts/api-server/dist/index.mjs

# Rebuild API server if needed
source .env && NODE_ENV=development pnpm --filter @workspace/api-server run build

# Mail app
MSYS_NO_PATHCONV=1 PORT=3000 BASE_PATH="/" pnpm --filter @workspace/mail-app run dev
```

## KEY RULES

- .toISOString() on ALL Drizzle timestamps before Zod parse
- queryKey required on every Orval useGet* hook
- Relative URLs only in frontend (never /api/...)
- No console.log in server code -- use req.log or logger
- Trust pnpm run typecheck over editor LSP
- Do not run pnpm dev at workspace root
- After OpenAPI spec changes: pnpm --filter @workspace/api-spec run codegen

## FEATURE WORKFLOW

1. Edit lib/api-spec/openapi.yaml
2. Run: pnpm --filter @workspace/api-spec run codegen
3. Add DB schema in lib/db/src/schema/mail.ts if needed
4. Implement route in artifacts/api-server/src/routes/mail.ts
5. Consume in frontend via generated hooks
6. Run: pnpm run typecheck

## FILE MAP

| Concern | Path |
|---------|------|
| API spec (source of truth) | lib/api-spec/openapi.yaml |
| Generated React Query hooks | lib/api-client-react/src/ |
| Generated Zod schemas | lib/api-zod/src/ |
| DB schema -- mail | lib/db/src/schema/mail.ts |
| Mail API routes | artifacts/api-server/src/routes/mail.ts |
| Mail app pages | artifacts/mail-app/src/pages/ |
| Mail app layout | artifacts/mail-app/src/components/layout.tsx |
| Shared UI | lib/ui/src/components/ui/ |
| Custom fetch | lib/api-client-react/src/custom-fetch.ts |
| Vite config | artifacts/mail-app/vite.config.ts |
| Workspace config | pnpm-workspace.yaml |

## CROSS-REFERENCES

- Global instructions: ~/.claude/CLAUDE.md
- VitalMatrix master root: C:\Users\Lenovo\VitalMatrix\CLAUDE.md
- Rebuilding instructions: C:\Users\Lenovo\VitalMatrix\Reference\SessionWraps\RebuildingInstructions_WorkspaceHub_2026-07-21.txt
- Upstream repo: github.com/Sfaisal1975/workspace-hub
- Brief: CLAUDE_CODE_BRIEF.md (repo root)

---
Correspondence | Root #23 | 21 July 2026
