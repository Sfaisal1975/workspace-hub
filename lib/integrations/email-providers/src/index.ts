export type {
  EmailProvider,
  EmailMessage,
  EmailFolder,
  EmailAddress,
  EmailAttachment,
  SendEmailParams,
  ListMessagesParams,
  ListMessagesResult,
  GmailCredentials,
  ICloudCredentials,
} from "./types";

export { GmailProvider, getGmailAuthUrl, exchangeGmailCode } from "./gmail";
export { ICloudProvider } from "./icloud";
