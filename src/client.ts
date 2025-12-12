import { HttpClient } from "./core/http-client";
import { AuthService } from "./modules/auth/service";
import { MailService } from "./modules/mail/service";
import { AuthCredentials } from "./modules/auth/types";
import { GetMailsOptions } from "./modules/mail/types";

export class MonLyceeClient {
  private httpClient: HttpClient;
  public auth: AuthService;
  public mail: MailService;

  constructor() {
    this.httpClient = new HttpClient();
    this.auth = new AuthService(this.httpClient);
    this.mail = new MailService(this.httpClient);
  }

  /**
   * Authenticates with the MonLycee platform.
   * @param credentials - User authentication credentials
   */
  async login(credentials: AuthCredentials): Promise<void> {
    return this.auth.login(credentials);
  }

  /**
   * Retrieves a list of email headers from the user's mailbox.
   * @param options - Options for retrieving emails
   */
  async getMails(options?: GetMailsOptions): Promise<any> {
    return this.mail.getMails(options);
  }
}
