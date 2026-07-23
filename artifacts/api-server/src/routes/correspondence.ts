import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { correspondenceAccountsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

function paramString(val: string | string[]): string {
  return Array.isArray(val) ? val[0] : val;
}

const router: IRouter = Router();

/* ---------- accounts ---------- */

router.get("/accounts", async (_req: Request, res: Response) => {
  const rows = await db
    .select({
      id: correspondenceAccountsTable.id,
      displayName: correspondenceAccountsTable.displayName,
      email: correspondenceAccountsTable.email,
      provider: correspondenceAccountsTable.provider,
      isActive: correspondenceAccountsTable.isActive,
      lastSyncAt: correspondenceAccountsTable.lastSyncAt,
      createdAt: correspondenceAccountsTable.createdAt,
    })
    .from(correspondenceAccountsTable)
    .orderBy(correspondenceAccountsTable.displayName);

  const serialized = rows.map((r) => ({
    ...r,
    lastSyncAt: r.lastSyncAt?.toISOString() ?? null,
    createdAt: r.createdAt?.toISOString() ?? null,
  }));

  res.json(serialized);
});

router.get("/accounts/:accountId", async (req: Request, res: Response) => {
  const [row] = await db
    .select({
      id: correspondenceAccountsTable.id,
      displayName: correspondenceAccountsTable.displayName,
      email: correspondenceAccountsTable.email,
      provider: correspondenceAccountsTable.provider,
      isActive: correspondenceAccountsTable.isActive,
      lastSyncAt: correspondenceAccountsTable.lastSyncAt,
      createdAt: correspondenceAccountsTable.createdAt,
    })
    .from(correspondenceAccountsTable)
    .where(eq(correspondenceAccountsTable.id, paramString(req.params.accountId)));

  if (!row) {
    res.status(404).json({ error: "Account not found" });
    return;
  }

  res.json({
    ...row,
    lastSyncAt: row.lastSyncAt?.toISOString() ?? null,
    createdAt: row.createdAt?.toISOString() ?? null,
  });
});

router.post("/accounts", async (req: Request, res: Response) => {
  const { displayName, email, provider, credentialsJson, metadataJson } = req.body;

  if (!displayName || !email || !provider || !credentialsJson) {
    res.status(400).json({ error: "Missing required fields: displayName, email, provider, credentialsJson" });
    return;
  }

  if (provider !== "gmail" && provider !== "icloud") {
    res.status(400).json({ error: "Provider must be 'gmail' or 'icloud'" });
    return;
  }

  const id = randomUUID();
  const [row] = await db
    .insert(correspondenceAccountsTable)
    .values({
      id,
      userId: "default",
      displayName,
      email,
      provider,
      credentialsJson: JSON.stringify(credentialsJson),
      metadataJson: metadataJson ? JSON.stringify(metadataJson) : null,
    })
    .returning();

  res.status(201).json({
    id: row.id,
    displayName: row.displayName,
    email: row.email,
    provider: row.provider,
    isActive: row.isActive,
    lastSyncAt: row.lastSyncAt?.toISOString() ?? null,
    createdAt: row.createdAt?.toISOString() ?? null,
  });
});

router.delete("/accounts/:accountId", async (req: Request, res: Response) => {
  const [deleted] = await db
    .delete(correspondenceAccountsTable)
    .where(eq(correspondenceAccountsTable.id, paramString(req.params.accountId)))
    .returning({ id: correspondenceAccountsTable.id });

  if (!deleted) {
    res.status(404).json({ error: "Account not found" });
    return;
  }

  res.json({ success: true });
});

/* ---------- Gmail OAuth2 flow ---------- */

router.get("/auth/gmail/url", (_req: Request, res: Response) => {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    res.status(500).json({ error: "Gmail OAuth2 not configured. Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI." });
    return;
  }

  // Lazy import to avoid loading googleapis when not needed
  import("@workspace/email-providers").then(({ getGmailAuthUrl }) => {
    const url = getGmailAuthUrl(clientId, clientSecret, redirectUri);
    res.json({ url });
  }).catch((err) => {
    res.status(500).json({ error: "Failed to generate auth URL" });
  });
});

router.post("/auth/gmail/callback", async (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code) {
    res.status(400).json({ error: "Missing authorization code" });
    return;
  }

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    res.status(500).json({ error: "Gmail OAuth2 not configured" });
    return;
  }

  try {
    const { exchangeGmailCode } = await import("@workspace/email-providers");
    const credentials = await exchangeGmailCode(clientId, clientSecret, redirectUri, code);
    res.json({ credentials });
  } catch (err) {
    res.status(400).json({ error: "Failed to exchange authorization code" });
  }
});

export default router;
