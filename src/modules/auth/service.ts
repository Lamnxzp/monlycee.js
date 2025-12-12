import { HttpClient } from "../../core/http-client";
import { AuthCredentials } from "./types";
import {
  BASE_PSN_URL,
  BASE_WEBMAIL_API_URL,
  BASE_ENT_URL,
  DEFAULT_HEADERS,
} from "../../core/constants";

export class AuthService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Authenticates with the MonLycee platform.
   *
   * @param credentials - User authentication credentials
   * @returns Promise that resolves when login is complete
   */
  async login(credentials: AuthCredentials): Promise<void> {
    const { data: html } = await this.httpClient.followRedirects(BASE_PSN_URL, {
      method: "GET",
    });

    const formMatch = html.match(/<form[^>]+action="([^"]+)"/);
    if (!formMatch) {
      throw new Error("Impossible de trouver le formulaire de connexion");
    }

    const formActionUrl = formMatch[1].replaceAll("&amp;", "&");

    const loginPayload = new URLSearchParams({
      username: credentials.username,
      password: credentials.password,
      credentialId: "",
    });

    await this.httpClient.followRedirects(formActionUrl, {
      method: "POST",
      data: loginPayload.toString(),
      headers: {
        Origin: "null",
        "Cache-Control": "max-age=0",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    await this.httpClient.post(`${BASE_WEBMAIL_API_URL}getVersion.json`, "", {
      headers: {
        ...DEFAULT_HEADERS,
        Referer: BASE_PSN_URL,
        Origin: "https://psn.monlycee.net",
      },
    });

    const { data: csrfData } = await this.httpClient.post(
      `${BASE_WEBMAIL_API_URL}createToken.json`,
      "",
      {
        headers: {
          ...DEFAULT_HEADERS,
          Referer: BASE_PSN_URL,
          Origin: "https://psn.monlycee.net",
        },
      }
    );

    const csrfToken = csrfData?.response?.tokenValue;
    if (!csrfToken) {
      throw new Error("Failed to obtain CSRF token");
    }

    this.httpClient.cookieJar.addCookie({
      name: "CSRF_TOKEN",
      value: csrfToken,
      path: "/",
      domain: "monlycee.net",
      originHost: "apis-mail.monlycee.net",
      creationIndex: this.httpClient.cookieJar.getNextCreationIndex(),
      expires: null,
      secure: false,
      httpOnly: false,
      sameSite: null,
    });

    await this.httpClient.followRedirects(
      `${BASE_ENT_URL}auth/openid/login?callBack=https%3A%2F%2Fent.monlycee.net%2Fwelcome`,
      {
        method: "GET",
        headers: {
          Referer: BASE_PSN_URL,
          Priority: "u=0, i",
        },
      }
    );
  }
}
