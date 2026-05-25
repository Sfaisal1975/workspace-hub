import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const publishedPagesTable = pgTable("published_pages", {
  notionPageId: text("notion_page_id").primaryKey(),
  title: text("title").notNull(),
  notionUrl: text("notion_url").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  isPublished: boolean("is_published").notNull().default(true),
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const insertPublishedPageSchema = createInsertSchema(publishedPagesTable)
  .omit({ publishedAt: true, updatedAt: true });

export const updatePublishedPageSchema = createInsertSchema(publishedPagesTable)
  .omit({ notionPageId: true, publishedAt: true, updatedAt: true })
  .partial();

export type InsertPublishedPage = z.infer<typeof insertPublishedPageSchema>;
export type UpdatePublishedPage = z.infer<typeof updatePublishedPageSchema>;
export type PublishedPage = typeof publishedPagesTable.$inferSelect;
