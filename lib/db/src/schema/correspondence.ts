import { pgTable, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const correspondenceAccountsTable = pgTable("correspondence_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull(),
  provider: text("provider", { enum: ["gmail", "icloud"] }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  /** Gmail: OAuth2 tokens (access, refresh, expiry). iCloud: app-specific password (encrypted). */
  credentialsJson: text("credentials_json").notNull(),
  /** Provider-specific metadata (e.g. Gmail historyId, iCloud IMAP host override) */
  metadataJson: text("metadata_json"),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const insertCorrespondenceAccountSchema = createInsertSchema(correspondenceAccountsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCorrespondenceAccount = z.infer<typeof insertCorrespondenceAccountSchema>;
export type CorrespondenceAccount = typeof correspondenceAccountsTable.$inferSelect;
