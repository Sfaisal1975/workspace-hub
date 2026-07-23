import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";
import type {
  EmailProvider,
  EmailMessage,
  EmailFolder,
  EmailAddress,
  SendEmailParams,
  ListMessagesParams,
  ListMessagesResult,
  ICloudCredentials,
} from "./types";

const DEFAULT_IMAP_HOST = "imap.mail.me.com";
const DEFAULT_SMTP_HOST = "smtp.mail.me.com";

export class ICloudProvider implements EmailProvider {
  readonly providerId = "icloud" as const;
  private readonly credentials: ICloudCredentials;

  constructor(credentials: ICloudCredentials) {
    this.credentials = credentials;
  }

  private createImapClient(): ImapFlow {
    return new ImapFlow({
      host: this.credentials.imapHost ?? DEFAULT_IMAP_HOST,
      port: 993,
      secure: true,
      auth: {
        user: this.credentials.username,
        pass: this.credentials.appPassword,
      },
      logger: false,
    });
  }

  private createSmtpTransport() {
    return nodemailer.createTransport({
      host: this.credentials.smtpHost ?? DEFAULT_SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: this.credentials.username,
        pass: this.credentials.appPassword,
      },
    });
  }

  async validateCredentials(): Promise<boolean> {
    const client = this.createImapClient();
    try {
      await client.connect();
      await client.logout();
      return true;
    } catch {
      return false;
    }
  }

  async listFolders(): Promise<EmailFolder[]> {
    const client = this.createImapClient();
    try {
      await client.connect();
      const mailboxes = await client.list();
      const folders: EmailFolder[] = [];

      for (const mb of mailboxes) {
        const type = mapMailboxType(mb.specialUse ?? "", mb.path);
        const status = await client.status(mb.path, { messages: true, unseen: true });
        folders.push({
          id: mb.path,
          name: mb.name,
          type,
          unreadCount: status.unseen ?? 0,
          totalCount: status.messages ?? 0,
        });
      }

      await client.logout();
      return folders;
    } catch (err) {
      await client.logout().catch(() => {});
      throw err;
    }
  }

  async listMessages(params: ListMessagesParams): Promise<ListMessagesResult> {
    const client = this.createImapClient();
    try {
      await client.connect();
      const mailbox = params.folderId ?? "INBOX";
      const lock = await client.getMailboxLock(mailbox);

      try {
        const mb = client.mailbox;
        if (!mb) throw new Error("Failed to open mailbox");
        const totalExists = mb.exists;

        const maxResults = params.maxResults ?? 25;
        const startSeq = params.pageToken ? Number(params.pageToken) : Math.max(1, totalExists - maxResults + 1);
        const endSeq = params.pageToken ? startSeq + maxResults - 1 : totalExists;

        const messages: EmailMessage[] = [];
        const range = `${startSeq}:${Math.min(endSeq, totalExists)}`;

        for await (const msg of client.fetch(range, {
          envelope: true,
          flags: true,
          bodyStructure: true,
          source: true,
        })) {
          messages.push(imapMessageToEmail(msg));
        }

        const nextStart = startSeq - maxResults;
        const nextPageToken = nextStart >= 1 ? String(nextStart) : undefined;

        await lock.release();
        await client.logout();

        return { messages: messages.reverse(), nextPageToken };
      } catch (err) {
        lock.release();
        throw err;
      }
    } catch (err) {
      await client.logout().catch(() => {});
      throw err;
    }
  }

  async getMessage(messageId: string): Promise<EmailMessage> {
    const client = this.createImapClient();
    try {
      await client.connect();
      const lock = await client.getMailboxLock("INBOX");

      try {
        let found: EmailMessage | null = null;
        for await (const msg of client.fetch(messageId, {
          envelope: true,
          flags: true,
          bodyStructure: true,
          source: true,
        }, { uid: true })) {
          found = imapMessageToEmail(msg);
        }
        lock.release();
        await client.logout();

        if (!found) throw new Error(`Message ${messageId} not found`);
        return found;
      } catch (err) {
        lock.release();
        throw err;
      }
    } catch (err) {
      await client.logout().catch(() => {});
      throw err;
    }
  }

  async sendMessage(params: SendEmailParams): Promise<{ messageId: string }> {
    const transport = this.createSmtpTransport();
    const info = await transport.sendMail({
      from: this.credentials.username,
      to: params.to.map((a) => `${a.name} <${a.address}>`).join(", "),
      cc: params.cc?.map((a) => `${a.name} <${a.address}>`).join(", "),
      bcc: params.bcc?.map((a) => `${a.name} <${a.address}>`).join(", "),
      subject: params.subject,
      text: params.body,
      html: params.bodyHtml,
      inReplyTo: params.replyToMessageId,
    });
    return { messageId: info.messageId };
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.setFlag(messageId, "\\Seen", true);
  }

  async markAsUnread(messageId: string): Promise<void> {
    await this.setFlag(messageId, "\\Seen", false);
  }

  async toggleStar(messageId: string, starred: boolean): Promise<void> {
    await this.setFlag(messageId, "\\Flagged", starred);
  }

  async trash(messageId: string): Promise<void> {
    const client = this.createImapClient();
    try {
      await client.connect();
      const lock = await client.getMailboxLock("INBOX");
      try {
        await client.messageMove(messageId, "Trash", { uid: true });
      } finally {
        lock.release();
      }
      await client.logout();
    } catch (err) {
      await client.logout().catch(() => {});
      throw err;
    }
  }

  async moveToFolder(messageId: string, folderId: string): Promise<void> {
    const client = this.createImapClient();
    try {
      await client.connect();
      const lock = await client.getMailboxLock("INBOX");
      try {
        await client.messageMove(messageId, folderId, { uid: true });
      } finally {
        lock.release();
      }
      await client.logout();
    } catch (err) {
      await client.logout().catch(() => {});
      throw err;
    }
  }

  async addLabel(messageId: string, label: string): Promise<void> {
    await this.setFlag(messageId, label, true);
  }

  async removeLabel(messageId: string, label: string): Promise<void> {
    await this.setFlag(messageId, label, false);
  }

  private async setFlag(messageId: string, flag: string, add: boolean): Promise<void> {
    const client = this.createImapClient();
    try {
      await client.connect();
      const lock = await client.getMailboxLock("INBOX");
      try {
        if (add) {
          await client.messageFlagsAdd(messageId, [flag], { uid: true });
        } else {
          await client.messageFlagsRemove(messageId, [flag], { uid: true });
        }
      } finally {
        lock.release();
      }
      await client.logout();
    } catch (err) {
      await client.logout().catch(() => {});
      throw err;
    }
  }
}

function mapMailboxType(specialUse: string, path: string): EmailFolder["type"] {
  const map: Record<string, EmailFolder["type"]> = {
    "\\Inbox": "inbox",
    "\\Sent": "sent",
    "\\Drafts": "drafts",
    "\\Trash": "trash",
    "\\Junk": "spam",
    "\\Archive": "archive",
  };
  if (map[specialUse]) return map[specialUse];
  if (path.toLowerCase() === "inbox") return "inbox";
  return "custom";
}

function imapMessageToEmail(msg: any): EmailMessage {
  const envelope = msg.envelope ?? {};
  const flags: Set<string> = msg.flags ?? new Set();

  const mapAddr = (addrs: any[]): EmailAddress[] =>
    (addrs ?? []).map((a: any) => ({
      name: a.name ?? "",
      address: `${a.mailbox ?? ""}@${a.host ?? ""}`,
    }));

  const bodyText = msg.source
    ? Buffer.from(msg.source).toString("utf-8")
    : "";

  return {
    id: String(msg.uid ?? msg.seq),
    threadId: envelope.messageId ?? undefined,
    subject: envelope.subject ?? "(no subject)",
    from: mapAddr(envelope.from)[0] ?? { name: "", address: "" },
    to: mapAddr(envelope.to),
    cc: envelope.cc ? mapAddr(envelope.cc) : undefined,
    date: envelope.date ? new Date(envelope.date) : new Date(),
    body: bodyText,
    preview: bodyText.substring(0, 200).replace(/\s+/g, " "),
    isRead: flags.has("\\Seen"),
    isStarred: flags.has("\\Flagged"),
    labels: [...flags],
    hasAttachments: msg.bodyStructure?.childNodes?.some(
      (n: any) => n.disposition === "attachment",
    ) ?? false,
  };
}
