import { HttpClient } from "./core/http-client";
import { MailService, AuthService, AccountService } from "./api";
import { AuthCredentials, GetMailsOptions } from "./types";

export class MonLyceeClient {
  private httpClient: HttpClient;
  public auth: AuthService;
  public mail: MailService;
  public account: AccountService;

  constructor() {
    this.httpClient = new HttpClient();
    this.auth = new AuthService(this.httpClient);
    this.mail = new MailService(this.httpClient);
    this.account = new AccountService(this.httpClient);
  }

  /**
   * Authenticates with the MonLycee platform.
   * @param credentials - User authentication credentials
   */
  async login(credentials: AuthCredentials): Promise<void> {
    return this.auth.login(credentials);
  }

  /**
   * Fetches the authenticated user's information from the ENT API.
   * @returns Promise resolving to the user information object.
   */
  async getUserInfo(): Promise<any> {
    return this.account.getUserInfo();
  }

  /**
   * Fetches the user's profile from the PSN API.
   * @remarks The `typeLabel` field may contain replacement characters (�) due to server-side encoding issues.
   * @returns Promise resolving to the profile object.
   */
  async getProfile(): Promise<any> {
    return this.account.getProfile();
  }

  /**
   * Retrieves a list of email headers from the user's mailbox.
   *
   * @param options - Options for retrieving emails (folder, sort order, pagination)
   * @returns Promise resolving to array of email header objects
   */
  async getMails(options?: GetMailsOptions): Promise<any> {
    return this.mail.getMails(options);
  }
}
