/** Unified email provider interface. Both Gmail and iCloud implement this. */

export interface EmailAddress {
  name: string;
  address: string;
}

export interface EmailMessage {
  id: string;
  threadId?: string;
  subject: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  date: Date;
  body: string;
  bodyHtml?: string;
  preview: string;
  isRead: boolean;
  isStarred: boolean;
  labels: string[];
  hasAttachments: boolean;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface EmailFolder {
  id: string;
  name: string;
  type: "inbox" | "sent" | "drafts" | "trash" | "spam" | "archive" | "custom";
  unreadCount: number;
  totalCount: number;
}

export interface SendEmailParams {
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  body: string;
  bodyHtml?: string;
  replyToMessageId?: string;
}

export interface ListMessagesParams {
  folderId?: string;
  label?: string;
  query?: string;
  maxResults?: number;
  pageToken?: string;
}

export interface ListMessagesResult {
  messages: EmailMessage[];
  nextPageToken?: string;
}

export interface EmailProvider {
  readonly providerId: "gmail" | "icloud";

  /** Test that stored credentials are still valid. */
  validateCredentials(): Promise<boolean>;

  /** List available folders/labels. */
  listFolders(): Promise<EmailFolder[]>;

  /** List messages in a folder or matching a query. */
  listMessages(params: ListMessagesParams): Promise<ListMessagesResult>;

  /** Get a single message by ID. */
  getMessage(messageId: string): Promise<EmailMessage>;

  /** Send a new message or reply. */
  sendMessage(params: SendEmailParams): Promise<{ messageId: string }>;

  /** Mark a message as read. */
  markAsRead(messageId: string): Promise<void>;

  /** Mark a message as unread. */
  markAsUnread(messageId: string): Promise<void>;

  /** Toggle star/flag on a message. */
  toggleStar(messageId: string, starred: boolean): Promise<void>;

  /** Move a message to trash. */
  trash(messageId: string): Promise<void>;

  /** Move a message to a folder/label. */
  moveToFolder(messageId: string, folderId: string): Promise<void>;

  /** Add a label (Gmail) or flag (IMAP). */
  addLabel(messageId: string, label: string): Promise<void>;

  /** Remove a label (Gmail) or flag (IMAP). */
  removeLabel(messageId: string, label: string): Promise<void>;
}

/** Credentials shape stored in correspondenceAccountsTable.credentialsJson */
export interface GmailCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
}

export interface ICloudCredentials {
  /** iCloud email address (or Apple ID) */
  username: string;
  /** App-specific password */
  appPassword: string;
  /** IMAP host override (default: imap.mail.me.com) */
  imapHost?: string;
  /** SMTP host override (default: smtp.mail.me.com) */
  smtpHost?: string;
}
