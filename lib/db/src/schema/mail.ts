import { pgTable, text, boolean, integer, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mailAccountsTable = pgTable("mail_accounts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  provider: text("provider").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertMailAccountSchema = createInsertSchema(mailAccountsTable).omit({ id: true, createdAt: true });
export type InsertMailAccount = z.infer<typeof insertMailAccountSchema>;
export type MailAccount = typeof mailAccountsTable.$inferSelect;

export const mailFoldersTable = pgTable("mail_folders", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  accountId: text("account_id").notNull(),
  type: text("type", { enum: ["inbox", "sent", "drafts", "trash", "spam", "archive"] }).notNull(),
  unreadCount: integer("unread_count").default(0).notNull(),
});

export const insertMailFolderSchema = createInsertSchema(mailFoldersTable).omit({ id: true });
export type InsertMailFolder = z.infer<typeof insertMailFolderSchema>;
export type MailFolder = typeof mailFoldersTable.$inferSelect;

export const emailsTable = pgTable("emails", {
  id: text("id").primaryKey(),
  subject: text("subject").notNull(),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email").notNull(),
  senderAvatarUrl: text("sender_avatar_url"),
  recipientsJson: text("recipients_json").notNull(),
  folderId: text("folder_id").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  isStarred: boolean("is_starred").default(false).notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow(),
  body: text("body").notNull(),
  preview: text("preview").notNull(),
  hasAttachments: boolean("has_attachments").default(false).notNull(),
});

export const insertEmailSchema = createInsertSchema(emailsTable).omit({ id: true });
export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Email = typeof emailsTable.$inferSelect;

export const emailAttachmentsTable = pgTable("email_attachments", {
  id: text("id").primaryKey(),
  emailId: text("email_id").notNull(),
  name: text("name").notNull(),
  size: integer("size").notNull(),
  mimeType: text("mime_type").notNull(),
});

export const insertEmailAttachmentSchema = createInsertSchema(emailAttachmentsTable).omit({ id: true });
export type InsertEmailAttachment = z.infer<typeof insertEmailAttachmentSchema>;
export type EmailAttachment = typeof emailAttachmentsTable.$inferSelect;

export const contactsTable = pgTable("contacts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  avatarUrl: text("avatar_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertContactSchema = createInsertSchema(contactsTable).omit({ id: true, createdAt: true });
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contactsTable.$inferSelect;

export const calendarEventsTable = pgTable("calendar_events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }).notNull(),
  location: text("location"),
  description: text("description"),
});

export const insertCalendarEventSchema = createInsertSchema(calendarEventsTable).omit({ id: true });
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = typeof calendarEventsTable.$inferSelect;

export const calendarEventAttendeesTable = pgTable("calendar_event_attendees", {
  id: serial("id").primaryKey(),
  eventId: text("event_id").notNull(),
  email: text("email").notNull(),
  name: text("name"),
  status: text("status", { enum: ["accepted", "tentative", "declined", "pending"] }).default("pending").notNull(),
});

export const insertCalendarEventAttendeeSchema = createInsertSchema(calendarEventAttendeesTable).omit({ id: true });
export type InsertCalendarEventAttendee = z.infer<typeof insertCalendarEventAttendeeSchema>;
export type CalendarEventAttendee = typeof calendarEventAttendeesTable.$inferSelect;
