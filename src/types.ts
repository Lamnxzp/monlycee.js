export interface AuthCredentials {
  username: string;
  password: string;
}

export interface Mail {
  id: string;
  subject: string;
  from: string;
  date: Date;
}

export type MailFolder =
  | "SF_INBOX"
  | "SF_DRAFT"
  | "SF_OUTBOX"
  | "SF_JUNK"
  | "SF_TRASH"
  | "VF_flagged"
  | "VF_attachments"
  | "VF_unread"
  | (string & {});

export interface GetMailsOptions {
  /**
   * The folder to retrieve emails from. Defaults to "SF_INBOX" (Inbox).
   *
   * Available folders:
   * - `"SF_INBOX"` - Inbox (received emails)
   * - `"SF_DRAFT"` - Drafts (saved but not sent)
   * - `"SF_OUTBOX"` - Outbox (sent emails)
   * - `"SF_JUNK"` - Spam/Junk folder
   * - `"SF_TRASH"` - Trash (deleted emails)
   * - `"VF_flagged"` - Flagged emails
   * - `"VF_attachments"` - Emails with attachments
   * - `"VF_unread"` - Unread emails
   * - Or any custom folder string
   */
  folder?: MailFolder;
  /**
   * Sort order for returned mails.
   *
   * Defaults to `dateDesc` (newest first).
   *
   * Available options:
   * - `dateAsc`      — sort by date oldest→newest
   * - `dateDesc`     — sort by date newest→oldest
   */
  sortBy?: SortBy;
  /**
   * Page number to fetch (1-based). Defaults to 1.
   */
  page?: number;
  /**
   * Number of mails per page. Defaults to 30.
   */
  perPage?: number;
}

export type SortBy =
  | 'dateAsc'
  | 'dateDesc';

export interface Cookie {
  name: string;
  value: string;
  path: string;
  domain: string | null;
  originHost: string;
  creationIndex: number;
  expires: Date | null;
  secure: boolean;
  httpOnly: boolean;
  sameSite: string | null;
}