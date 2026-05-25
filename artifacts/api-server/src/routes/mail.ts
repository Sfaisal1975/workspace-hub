import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import {
  mailAccountsTable,
  mailFoldersTable,
  emailsTable,
  emailAttachmentsTable,
  contactsTable,
  calendarEventsTable,
  calendarEventAttendeesTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListMailAccountsResponse,
  ListMailFoldersResponse,
  ListMailFoldersParams,
  ListFolderEmailsResponse,
  ListFolderEmailsParams,
  GetEmailResponse,
  GetEmailParams,
  UpdateEmailBody,
  MoveEmailBody,
  SendEmailBody,
  ListContactsResponse,
  CreateContactBody,
  DeleteContactResponse,
  ListCalendarEventsResponse,
  CreateCalendarEventBody,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

/* ---------- accounts ---------- */
router.get("/mail/accounts", async (_req: Request, res: Response) => {
  const rows = await db.select().from(mailAccountsTable).orderBy(mailAccountsTable.name);
  res.json(ListMailAccountsResponse.parse(rows));
});

/* ---------- folders ---------- */
router.get("/mail/accounts/:accountId/folders", async (req: Request, res: Response) => {
  const { accountId } = ListMailFoldersParams.parse(req.params);
  const rows = await db
    .select()
    .from(mailFoldersTable)
    .where(eq(mailFoldersTable.accountId, accountId))
    .orderBy(mailFoldersTable.name);
  res.json(ListMailFoldersResponse.parse(rows));
});

/* ---------- folder emails ---------- */
router.get("/mail/folders/:folderId/emails", async (req: Request, res: Response) => {
  const { folderId } = ListFolderEmailsParams.parse(req.params);
  const rows = await db
    .select()
    .from(emailsTable)
    .where(eq(emailsTable.folderId, folderId))
    .orderBy(emailsTable.sentAt);
  const list = rows.map((r) => ({
    ...r,
    sentAt: r.sentAt instanceof Date ? r.sentAt.toISOString() : r.sentAt,
    sender: { name: r.senderName, email: r.senderEmail, avatarUrl: r.senderAvatarUrl },
    recipients: JSON.parse(r.recipientsJson) as { name: string; email: string }[],
  }));
  res.json(ListFolderEmailsResponse.parse(list));
});

/* ---------- email detail ---------- */
router.get("/mail/emails/:id", async (req: Request, res: Response) => {
  const { id } = GetEmailParams.parse(req.params);
  const [email] = await db.select().from(emailsTable).where(eq(emailsTable.id, id));
  if (!email) {
    res.status(404).json({ error: "Email not found" });
    return;
  }
  const attachments = await db
    .select()
    .from(emailAttachmentsTable)
    .where(eq(emailAttachmentsTable.emailId, id));
  const detail = {
    ...email,
    sentAt: email.sentAt instanceof Date ? email.sentAt.toISOString() : email.sentAt,
    sender: { name: email.senderName, email: email.senderEmail, avatarUrl: email.senderAvatarUrl },
    recipients: JSON.parse(email.recipientsJson) as { name: string; email: string }[],
    attachments,
  };
  res.json(GetEmailResponse.parse(detail));
});

/* ---------- update email (read, star) ---------- */
router.patch("/mail/emails/:id", async (req: Request, res: Response) => {
  const { id } = GetEmailParams.parse(req.params);
  const body = UpdateEmailBody.parse(req.body);
  const [email] = await db.select().from(emailsTable).where(eq(emailsTable.id, id));
  if (!email) {
    res.status(404).json({ error: "Email not found" });
    return;
  }
  const updated = await db
    .update(emailsTable)
    .set({
      isRead: body.isRead ?? email.isRead,
      isStarred: body.isStarred ?? email.isStarred,
      folderId: body.folderId ?? email.folderId,
    })
    .where(eq(emailsTable.id, id))
    .returning();
  const result = {
    ...updated[0],
    sentAt: updated[0].sentAt instanceof Date ? updated[0].sentAt.toISOString() : updated[0].sentAt,
    sender: { name: updated[0].senderName, email: updated[0].senderEmail, avatarUrl: updated[0].senderAvatarUrl },
    recipients: JSON.parse(updated[0].recipientsJson) as { name: string; email: string }[],
  };
  res.json(result);
});

/* ---------- move email ---------- */
router.post("/mail/emails/:id/move", async (req: Request, res: Response) => {
  const { id } = GetEmailParams.parse(req.params);
  const { folderId } = MoveEmailBody.parse(req.body);
  const [email] = await db.select().from(emailsTable).where(eq(emailsTable.id, id));
  if (!email) {
    res.status(404).json({ error: "Email not found" });
    return;
  }
  const updated = await db
    .update(emailsTable)
    .set({ folderId })
    .where(eq(emailsTable.id, id))
    .returning();
  const result = {
    ...updated[0],
    sentAt: updated[0].sentAt instanceof Date ? updated[0].sentAt.toISOString() : updated[0].sentAt,
    sender: { name: updated[0].senderName, email: updated[0].senderEmail, avatarUrl: updated[0].senderAvatarUrl },
    recipients: JSON.parse(updated[0].recipientsJson) as { name: string; email: string }[],
  };
  res.json(result);
});

/* ---------- send email ---------- */
router.post("/mail/emails", async (req: Request, res: Response) => {
  const body = SendEmailBody.parse(req.body);
  const folderId = "sent";
  const recipients = body.recipients.map((email) => ({ name: email.split("@")[0], email }));
  const [account] = await db.select().from(mailAccountsTable).limit(1);
  const senderName = account?.name ?? "User";
  const senderEmail = account?.email ?? "user@example.com";
  const id = `em-${Date.now()}`;
  const preview = body.body.slice(0, 200).replace(/\n/g, " ");
  const inserted = await db
    .insert(emailsTable)
    .values({
      id,
      subject: body.subject,
      senderName,
      senderEmail,
      senderAvatarUrl: account?.avatarUrl,
      recipientsJson: JSON.stringify(recipients),
      folderId,
      body: body.body,
      preview,
      isRead: true,
      isStarred: false,
      hasAttachments: false,
    })
    .returning();
  const result = {
    ...inserted[0],
    sentAt: inserted[0].sentAt instanceof Date ? inserted[0].sentAt.toISOString() : inserted[0].sentAt,
    sender: { name: inserted[0].senderName, email: inserted[0].senderEmail, avatarUrl: inserted[0].senderAvatarUrl },
    recipients: JSON.parse(inserted[0].recipientsJson) as { name: string; email: string }[],
  };
  res.status(201).json(result);
});

/* ---------- contacts ---------- */
router.get("/mail/contacts", async (_req: Request, res: Response) => {
  const rows = await db.select().from(contactsTable).orderBy(contactsTable.name);
  res.json(ListContactsResponse.parse(rows));
});

router.post("/mail/contacts", async (req: Request, res: Response) => {
  const body = CreateContactBody.parse(req.body);
  const id = `ct-${Date.now()}`;
  const inserted = await db.insert(contactsTable).values({ id, ...body }).returning();
  res.status(201).json(inserted[0]);
});

router.delete("/mail/contacts/:id", async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await db.delete(contactsTable).where(eq(contactsTable.id, id));
  res.json(DeleteContactResponse.parse({ success: true }));
});

/* ---------- calendar events ---------- */
router.get("/mail/calendar/events", async (_req: Request, res: Response) => {
  const rows = await db.select().from(calendarEventsTable).orderBy(calendarEventsTable.startAt);
  const events = await Promise.all(
    rows.map(async (ev) => {
      const attendees = await db
        .select()
        .from(calendarEventAttendeesTable)
        .where(eq(calendarEventAttendeesTable.eventId, ev.id));
      return {
        ...ev,
        startAt: ev.startAt instanceof Date ? ev.startAt.toISOString() : ev.startAt,
        endAt: ev.endAt instanceof Date ? ev.endAt.toISOString() : ev.endAt,
        attendees,
      };
    }),
  );
  res.json(ListCalendarEventsResponse.parse(events));
});

router.post("/mail/calendar/events", async (req: Request, res: Response) => {
  const body = CreateCalendarEventBody.parse(req.body);
  const id = `ev-${Date.now()}`;
  const [event] = await db
    .insert(calendarEventsTable)
    .values({
      id,
      title: body.title,
      startAt: new Date(body.startAt),
      endAt: new Date(body.endAt),
      location: body.location,
      description: body.description,
    })
    .returning();

  if (body.attendees && body.attendees.length > 0) {
    for (const attendeeEmail of body.attendees) {
      await db.insert(calendarEventAttendeesTable).values({
        eventId: id,
        email: attendeeEmail,
        status: "pending",
      });
    }
  }

  const attendees = await db
    .select()
    .from(calendarEventAttendeesTable)
    .where(eq(calendarEventAttendeesTable.eventId, id));

  res.status(201).json({
    ...event,
    startAt: event.startAt instanceof Date ? event.startAt.toISOString() : event.startAt,
    endAt: event.endAt instanceof Date ? event.endAt.toISOString() : event.endAt,
    attendees,
  });
});

export default router;
