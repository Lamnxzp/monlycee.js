import { HttpClient } from "../core/http-client";
import { GetMailsOptions, SortBy } from "../types";
import { BASE_WEBMAIL_API_URL, DEFAULT_HEADERS } from "../core/constants";

const SORTBY_CODES: Record<SortBy, number> = {
  dateAsc: 44,
  dateDesc: 45,
};

export class MailService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Retrieves a list of email headers from the user's mailbox.
   *
   * @param options - Options for retrieving emails (folder, sort order, pagination)
   * @returns Array of email header objects
   */
  async getMails({
    folder = "SF_INBOX",
    sortBy = "dateDesc",
    page = 1,
    perPage = 30,
  }: GetMailsOptions = {}): Promise<any> {
    const csrfToken = this.httpClient.cookieJar.getCookie("CSRF_TOKEN")?.value;

    // perPage has no limit
    const safePage = Math.max(1, page);
    const start = (safePage - 1) * perPage;
    const end = start + perPage - 1;

    const payload = new URLSearchParams({
      FOLDER: folder,
      SORTBY: String(SORTBY_CODES[sortBy] ?? SORTBY_CODES.dateDesc),
      FLAGS_FILTER_TYPE: "0",
      NBDISPLAYMSG: String(perPage),
      returnProfileId: "gmhlProf",
      append: "false",
      PAGE: String(safePage),
      START: String(start),
      END: String(end),
      callContext: "pagintationInMailListInitRoute",
      DISPLAY_ATTACHMENTS_INFOS: "true",
      tok: csrfToken!, // todo: handle null
    });

    const { data: mailsData } = await this.httpClient.post(
      `${BASE_WEBMAIL_API_URL}getMailHeaderList.json`,
      payload.toString(),
      {
        headers: {
          ...DEFAULT_HEADERS,
          Referer: "https://web-mail.monlycee.net/",
          Origin: "https://web-mail.monlycee.net",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      }
    );
    return mailsData.response.mailHeader;
  }
}
