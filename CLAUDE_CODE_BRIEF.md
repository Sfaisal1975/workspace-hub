# Claude Code Routing Brief — Workspace Hub

> **Pull this repo:** `git clone https://github.com/Sfaisal1975/workspace-hub.git`
>
> After cloning, read this file first before touching any code.

## What This Is

A full-stack pnpm monorepo with three web apps sharing a PostgreSQL backend:

- **Mail App** (`artifacts/mail-app/`) — Outlook-style email client: Inbox, Compose, Calendar, Contacts, Settings
- **Notion Hub** (`artifacts/notion-hub/`) — Notion page explorer, content hub, search
- **Correspondence** (`artifacts/correspondence/`) — Unified email client: Gmail (OAuth2) + iCloud (IMAP/SMTP). Phase 1 scaffold complete; Phase 2 pending.
- **API Server** (`artifacts/api-server/`) — Express 5 backend serving all apps
- **Mockup Sandbox** (`artifacts/mockup-sandbox/`) — Canvas component preview server

## First-Time Setup After Clone

```bash
# 1. Install dependencies
pnpm install

# 2. Set required secrets (get from repo owner or replit secrets):
#    DATABASE_URL — PostgreSQL connection string
#    NOTION_API_KEY — for Notion Hub (optional for Mail app)
#    SESSION_SECRET — any random string

# 3. Push database schema
pnpm --filter @workspace/db run push

# 4. Seed demo data (run the SQL from api-server seed script or recreate manually)
#    See artifacts/api-server/src/routes/mail.ts bottom for seed SQL

# 5. Run everything
pnpm --filter @workspace/api-server run dev   # port 5000
pnpm --filter @workspace/mail-app run dev      # served by replit proxy at /mail/
pnpm --filter @workspace/notion-hub run dev    # served by replit proxy at /notion/
pnpm --filter @workspace/correspondence run dev # port 5174, /correspondence/

# 6. Full typecheck (do this before any PR)
pnpm run typecheck
```

## Architecture (Non-Obvious Stuff)

### 1. OpenAPI-First Contract

All API endpoints are defined in `lib/api-spec/openapi.yaml`. From this, Orval generates:
- React Query hooks → `lib/api-client-react/src/`
- Zod schemas → `lib/api-zod/src/`

**Regenerate after spec changes:**
```bash
pnpm --filter @workspace/api-spec run codegen
```

### 2. Date Serialization Gotcha

Drizzle `timestamp` columns return `Date` objects, but OpenAPI/Zod expects ISO strings. Every mail route response explicitly serializes dates:

```typescript
// In artifacts/api-server/src/routes/mail.ts
const response = {
  ...email,
  date: email.date.toISOString(),
  createdAt: email.createdAt?.toISOString(),
  // ... every timestamp field must be stringified
};
return GetEmailResponse.parse(response);
```

**If you add new timestamp fields to mail tables, you MUST add `.toISOString()` in the route responses or Zod parse will fail.**

### 3. Orval Query Key Requirement

Generated `useGet*` hooks require `queryKey` in options:

```typescript
// WRONG — TS2741 error
const { data } = useGetEmails({});

// RIGHT
const { data } = useGetEmails({ queryKey: ['emails'] });
```

### 4. Monorepo Routing

Each artifact has a `previewPath` registered via `.replit-artifact/artifact.toml`:
- Mail app → `/mail/`
- Notion Hub → `/notion/`
- API server → `/api/`

Use relative URLs in frontend code. Never use root-relative `/api/...` — it escapes the artifact prefix.

## Where Things Live

| Concern | Path |
|---------|------|
| API spec (source of truth) | `lib/api-spec/openapi.yaml` |
| Generated React Query hooks | `lib/api-client-react/src/` |
| Generated Zod schemas | `lib/api-zod/src/` |
| DB schema — mail tables | `lib/db/src/schema/mail.ts` |
| DB schema — notion tables | `lib/db/src/schema/publishedPages.ts` |
| DB schema — correspondence | `lib/db/src/schema/correspondence.ts` |
| Email providers lib | `lib/integrations/email-providers/src/` |
| Mail API routes | `artifacts/api-server/src/routes/mail.ts` |
| Notion API routes | `artifacts/api-server/src/routes/notion.ts` |
| Mail app pages | `artifacts/mail-app/src/pages/{inbox,calendar,contacts,compose,settings}.tsx` |
| Mail app layout | `artifacts/mail-app/src/components/layout.tsx` |
| Notion Hub pages | `artifacts/notion-hub/src/pages/{dashboard,databases,database,page,search,content-hub,public-page}.tsx` |
| Correspondence API routes | `artifacts/api-server/src/routes/correspondence.ts` |
| Correspondence app pages | `artifacts/correspondence/src/pages/{inbox,compose,accounts}.tsx` |
| Shared UI components | `lib/ui/src/components/ui/` |
| Shared theme/styles | `lib/ui/src/index.css` |

## API Endpoints (Mail)

All under `/api/mail/*`:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/mail/accounts` | List mail accounts |
| GET | `/mail/folders` | List folders for account |
| GET | `/mail/folders/{folderId}/emails` | List emails in folder |
| GET | `/mail/emails/{emailId}` | Get single email |
| POST | `/mail/emails/{emailId}/read` | Mark as read |
| POST | `/mail/emails/{emailId}/move` | Move to folder |
| POST | `/mail/emails/{emailId}/star` | Toggle star |
| POST | `/mail/emails/send` | Send new email |
| GET | `/mail/contacts` | List contacts |
| POST | `/mail/contacts` | Create contact |
| DELETE | `/mail/contacts/{contactId}` | Delete contact |
| GET | `/mail/calendar` | List calendar events |
| GET | `/mail/calendar/events/{eventId}` | Get event details |

## API Endpoints (Correspondence)

All under `/api/correspondence/*`:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/accounts` | List connected email accounts |
| GET | `/accounts/:accountId` | Get single account |
| POST | `/accounts` | Add email account (Gmail or iCloud) |
| DELETE | `/accounts/:accountId` | Remove account |
| GET | `/auth/gmail/url` | Get Gmail OAuth2 consent URL |
| POST | `/auth/gmail/callback` | Exchange OAuth2 code for tokens |

## Database Schema (Correspondence)

Table in `lib/db/src/schema/correspondence.ts`:

- `correspondence_accounts` — provider account (id, userId, displayName, email, provider [gmail|icloud], isActive, credentialsJson, metadataJson, lastSyncAt)

Env vars: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REDIRECT_URI`

## Database Schema (Mail)

Tables in `lib/db/src/schema/mail.ts`:

- `mail_accounts` — email account (id, name, email, provider, avatarUrl)
- `mail_folders` — folders per account (id, name, accountId, type, unreadCount)
- `emails` — email messages (id, accountId, folderId, sender JSON, recipients JSON, subject, body, isRead, isStarred, date, hasAttachments)
- `email_attachments` — attachments per email (id, emailId, filename, size, mimeType)
- `contacts` — contact list (id, accountId, name, email, company, phone, avatarUrl)
- `calendar_events` — events (id, accountId, title, description, location, startTime, endTime, isAllDay)
- `calendar_event_attendees` — event attendees (id, eventId, name, email, status)

All timestamps use `timestamp with time zone`. Drizzle returns `Date` objects; routes must `.toISOString()` them.

## Frontend Tech Stack

- **Routing:** `wouter` (Switch/Route)
- **Data fetching:** `@tanstack/react-query` + Orval-generated hooks
- **UI:** shadcn/ui components in `lib/ui/`
- **Styling:** Tailwind CSS
- **Icons:** `lucide-react`
- **Date formatting:** `date-fns`
- **Validation:** Zod v4 (`zod/v4` import path)

## Common Commands

```bash
# Full typecheck (trust this over editor/LSP when they disagree)
pnpm run typecheck

# Build libs only
pnpm run typecheck:libs

# Regenerate API hooks from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes (dev only)
pnpm --filter @workspace/db run push

# Run specific artifact typecheck
pnpm --filter @workspace/mail-app run typecheck
pnpm --filter @workspace/api-server run typecheck
```

## Working on This Repo

### Adding a new mail feature
1. Update `lib/api-spec/openapi.yaml` with new endpoints/schemas
2. Run `pnpm --filter @workspace/api-spec run codegen`
3. Add DB schema changes in `lib/db/src/schema/mail.ts` if needed
4. Implement route in `artifacts/api-server/src/routes/mail.ts`
5. Consume in frontend via generated hooks in `lib/api-client-react/`
6. Run `pnpm run typecheck` before committing

### Adding a new page to Mail app
1. Create page in `artifacts/mail-app/src/pages/your-page.tsx`
2. Add route in `artifacts/mail-app/src/App.tsx`
3. Add nav link in `artifacts/mail-app/src/components/layout.tsx` if sidebar nav

### Frontend-only changes
You can iterate on `mail-app` or `notion-hub` without touching the API server. Just restart the relevant workflow after changes.

## Critical Rules

- **Never use `console.log` in server code.** Use `req.log` in route handlers or the singleton `logger`.
- **Always include `queryKey`** when calling Orval-generated `useGet*` hooks.
- **Always `.toISOString()` Drizzle timestamps** before Zod parse in API responses.
- **Do not run `pnpm dev` at workspace root.** Each artifact has its own dev workflow.
- **Trust `pnpm run typecheck` over editor errors** for cross-package type issues.
- **Do not add leaf workspace packages** to root `tsconfig.json` references.

## Repo Owner

- GitHub: `Sfaisal1975`
- Repo: `https://github.com/Sfaisal1975/workspace-hub`
