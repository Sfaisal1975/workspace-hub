import { google } from "googleapis";
import type {
  EmailProvider,
  EmailMessage,
  EmailFolder,
  EmailAddress,
  SendEmailParams,
  ListMessagesParams,
  ListMessagesResult,
  GmailCredentials,
} from "./types";

interface GmailProviderConfig {
  clientId: string;
  clientSecret: string;
  credentials: GmailCredentials;
  onTokenRefresh?: (newCredentials: GmailCredentials) => Promise<void>;
}

export class GmailProvider implements EmailProvider {
  readonly providerId = "gmail" as const;
  private readonly gmail;
  private readonly auth;
  private readonly config: GmailProviderConfig;

  constructor(config: GmailProviderConfig) {
    this.config = config;
    this.auth = new google.auth.OAuth2(config.clientId, config.clientSecret);
    this.auth.setCredentials({
      access_token: config.credentials.accessToken,
      refresh_token: config.credentials.refreshToken,
      expiry_date: config.credentials.expiresAt,
    });

    this.auth.on("tokens", async (tokens) => {
      if (config.onTokenRefresh) {
        await config.onTokenRefresh({
          accessToken: tokens.access_token ?? config.credentials.accessToken,
          refreshToken: tokens.refresh_token ?? config.credentials.refreshToken,
          expiresAt: tokens.expiry_date ?? Date.now() + 3600_000,
          scope: config.credentials.scope,
        });
      }
    });

    this.gmail = google.gmail({ version: "v1", auth: this.auth });
  }

  async validateCredentials(): Promise<boolean> {
    try {
      await this.gmail.users.getProfile({ userId: "me" });
      return true;
    } catch {
      return false;
    }
  }

  async listFolders(): Promise<EmailFolder[]> {
    const res = await this.gmail.users.labels.list({ userId: "me" });
    const labels = res.data.labels ?? [];

    const typeMap: Record<string, EmailFolder["type"]> = {
      INBOX: "inbox",
      SENT: "sent",
      DRAFT: "drafts",
      TRASH: "trash",
      SPAM: "spam",
    };

    return labels.map((label) => ({
      id: label.id ?? "",
      name: label.name ?? "",
      type: typeMap[label.id ?? ""] ?? "custom",
      unreadCount: label.messagesUnread ?? 0,
      totalCount: label.messagesTotal ?? 0,
    }));
  }

  async listMessages(params: ListMessagesParams): Promise<ListMessagesResult> {
    const q = [params.query, params.label ? `label:${params.label}` : undefined]
      .filter(Boolean)
      .join(" ");

    const res = await this.gmail.users.messages.list({
      userId: "me",
      labelIds: params.folderId ? [params.folderId] : undefined,
      q: q || undefined,
      maxResults: params.maxResults ?? 25,
      pageToken: params.pageToken ?? undefined,
    });

    const messageIds = res.data.messages ?? [];
    const messages = await Promise.all(
      messageIds.map((m) => this.getMessage(m.id!)),
    );

    return {
      messages,
      nextPageToken: res.data.nextPageToken ?? undefined,
    };
  }

  async getMessage(messageId: string): Promise<EmailMessage> {
    const res = await this.gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    const headers = res.data.payload?.headers ?? [];
    const getHeader = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";

    const labelIds = res.data.labelIds ?? [];
    const body = this.extractBody(res.data.payload);

    return {
      id: res.data.id ?? messageId,
      threadId: res.data.threadId ?? undefined,
      subject: getHeader("Subject"),
      from: parseEmailAddress(getHeader("From")),
      to: parseEmailAddressList(getHeader("To")),
      cc: getHeader("Cc") ? parseEmailAddressList(getHeader("Cc")) : undefined,
      date: new Date(Number(res.data.internalDate ?? Date.now())),
      body: body.text,
      bodyHtml: body.html || undefined,
      preview: res.data.snippet ?? "",
      isRead: !labelIds.includes("UNREAD"),
      isStarred: labelIds.includes("STARRED"),
      labels: labelIds,
      hasAttachments: this.hasAttachments(res.data.payload),
    };
  }

  async sendMessage(params: SendEmailParams): Promise<{ messageId: string }> {
    const raw = buildRawEmail(params);
    const res = await this.gmail.users.messages.send({
      userId: "me",
      requestBody: { raw, threadId: params.replyToMessageId ? undefined : undefined },
    });
    return { messageId: res.data.id ?? "" };
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: { removeLabelIds: ["UNREAD"] },
    });
  }

  async markAsUnread(messageId: string): Promise<void> {
    await this.gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: { addLabelIds: ["UNREAD"] },
    });
  }

  async toggleStar(messageId: string, starred: boolean): Promise<void> {
    await this.gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: starred
        ? { addLabelIds: ["STARRED"] }
        : { removeLabelIds: ["STARRED"] },
    });
  }

  async trash(messageId: string): Promise<void> {
    await this.gmail.users.messages.trash({ userId: "me", id: messageId });
  }

  async moveToFolder(messageId: string, folderId: string): Promise<void> {
    await this.gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: { addLabelIds: [folderId] },
    });
  }

  async addLabel(messageId: string, label: string): Promise<void> {
    await this.gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: { addLabelIds: [label] },
    });
  }

  async removeLabel(messageId: string, label: string): Promise<void> {
    await this.gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: { removeLabelIds: [label] },
    });
  }

  private extractBody(payload: any): { text: string; html: string } {
    if (!payload) return { text: "", html: "" };

    let text = "";
    let html = "";

    const walk = (part: any) => {
      if (part.mimeType === "text/plain" && part.body?.data) {
        text = Buffer.from(part.body.data, "base64url").toString("utf-8");
      }
      if (part.mimeType === "text/html" && part.body?.data) {
        html = Buffer.from(part.body.data, "base64url").toString("utf-8");
      }
      if (part.parts) {
        for (const sub of part.parts) walk(sub);
      }
    };
    walk(payload);

    return { text, html };
  }

  private hasAttachments(payload: any): boolean {
    if (!payload) return false;
    const check = (part: any): boolean => {
      if (part.filename && part.filename.length > 0) return true;
      if (part.parts) return part.parts.some(check);
      return false;
    };
    return check(payload);
  }
}

/** Generate the OAuth2 consent URL for Gmail. */
export function getGmailAuthUrl(clientId: string, clientSecret: string, redirectUri: string): string {
  const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  return auth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.labels",
    ],
  });
}

/** Exchange an OAuth2 code for tokens. */
export async function exchangeGmailCode(
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  code: string,
): Promise<GmailCredentials> {
  const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const { tokens } = await auth.getToken(code);
  return {
    accessToken: tokens.access_token ?? "",
    refreshToken: tokens.refresh_token ?? "",
    expiresAt: tokens.expiry_date ?? Date.now() + 3600_000,
    scope: tokens.scope ?? "",
  };
}

function parseEmailAddress(raw: string): EmailAddress {
  const match = raw.match(/^(.+?)\s*<(.+?)>$/);
  if (match) return { name: match[1].replace(/^"|"$/g, "").trim(), address: match[2] };
  return { name: raw.split("@")[0], address: raw.trim() };
}

function parseEmailAddressList(raw: string): EmailAddress[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(parseEmailAddress);
}

function buildRawEmail(params: SendEmailParams): string {
  const lines = [
    `To: ${params.to.map((a) => `${a.name} <${a.address}>`).join(", ")}`,
    params.cc ? `Cc: ${params.cc.map((a) => `${a.name} <${a.address}>`).join(", ")}` : "",
    `Subject: ${params.subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "",
    params.body,
  ]
    .filter(Boolean)
    .join("\r\n");

  return Buffer.from(lines).toString("base64url");
}
