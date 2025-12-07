
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import https from "https";
import type { AuthCredentials, GetMailsOptions, SortBy, Cookie } from "./types";

const SORTBY_CODES: Record<SortBy, number> = {
  dateAsc: 44,
  dateDesc: 45,
};

export class MonLyceeClient {
  private httpClient: AxiosInstance;
  private cookies: Map<string, Cookie> = new Map();
  private creationCounter: number = 0;

  private readonly BASE_PSN_URL = "https://psn.monlycee.net/";
  private readonly BASE_ENT_URL = "https://ent.monlycee.net/";
  private readonly BASE_WEBMAIL_API_URL = "https://apis-mail.monlycee.net/webmail/xml/";

  private readonly DEFAULT_HEADERS = {
   "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7", 
    "Accept-Encoding": "gzip, deflate, br, zstd", 
    "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7", 
    "Priority": "u=0, i", 
    "Sec-Ch-Ua": "\"Google Chrome\";v=\"143\", \"Chromium\";v=\"143\", \"Not A(Brand\";v=\"24\"", 
    "Sec-Ch-Ua-Mobile": "?0", 
    "Sec-Ch-Ua-Platform": "\"Windows\"", 
    "Sec-Fetch-Dest": "document", 
    "Sec-Fetch-Mode": "navigate", 
    "Sec-Fetch-Site": "same-origin", 
    "Sec-Fetch-User": "?1", 
    "Upgrade-Insecure-Requests": "1", 
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36", 
  };

  constructor() {
    this.httpClient = axios.create({
      httpsAgent: new https.Agent({
        keepAlive: true,
        minVersion: "TLSv1.2",
      }),
      maxRedirects: 0,
      validateStatus: () => true,
    });

    // Interceptor to add cookies to requests
    this.httpClient.interceptors.request.use((config) => {
      const cookieHeader = this.getCookieHeader(config.url || "");
      if (cookieHeader) {
        config.headers.Cookie = cookieHeader;
      }
      return config;
    });

    // Interceptor to update cookies from responses
    this.httpClient.interceptors.response.use((response) => {
      const setCookies = response.headers["set-cookie"];
      if (setCookies && response.config.url) {
        const originHost = new URL(response.config.url).hostname;
        const newCookies = this.parseCookies(
          Array.isArray(setCookies) ? setCookies : [setCookies],
          originHost
        );
        this.addCookies(newCookies);
      }
      return response;
    });
  }

  /**
   * Parses Set-Cookie headers into cookie objects (RFC 6265).
   * @param setCookieHeaders - Array of Set-Cookie header values
   * @param originHost - The hostname that sent the cookies
   * @returns Cookie[]
   */
  private parseCookies(
    setCookieHeaders: string[],
    originHost: string
  ): Cookie[] {
    if (!setCookieHeaders) return [];
    return setCookieHeaders.map((cookieString) => {
      const parts = cookieString.split(";").map((s) => s.trim());
      const [nameValue, ...attributes] = parts;
      const eqIndex = nameValue.indexOf("=");
      const name = nameValue.slice(0, eqIndex);
      const value = nameValue.slice(eqIndex + 1);

      const cookie: Cookie = {
        name,
        value,
        originHost,
        creationIndex: this.creationCounter++,
        path: "/",
        domain: null,
        expires: null,
        secure: false,
        httpOnly: false,
        sameSite: null,
      };

      for (const attr of attributes) {
        const [attrName, attrValue] = attr.split("=").map((s) => s?.trim());
        const lowerAttrName = attrName?.toLowerCase();
        switch (lowerAttrName) {
          case "path":
            cookie.path = attrValue || "/";
            break;
          case "domain":
            cookie.domain = attrValue?.toLowerCase().replace(/^\./, "");
            break;
          case "expires":
            cookie.expires = attrValue ? new Date(attrValue) : null;
            break;
          case "secure":
            cookie.secure = true;
            break;
          case "httponly":
            cookie.httpOnly = true;
            break;
          case "samesite":
            cookie.sameSite = attrValue?.toLowerCase() || null;
            break;
        }
      }
      return cookie;
    });
  }

  /**
   * Adds or updates cookies in the store.
   * @param newCookies - Array of cookie objects to add
   */
  private addCookies(newCookies: Cookie[]): void {
    for (const cookie of newCookies) {
      if (cookie.value === "") {
        this.cookies.delete(this.getCookieKey(cookie));
      } else {
        this.cookies.set(this.getCookieKey(cookie), cookie);
      }
    }
  }

  /**
   * Generates a unique storage key for a cookie (RFC 6265).
   */
  private getCookieKey(cookie: Cookie): string {
    const domain = cookie.domain || cookie.originHost;
    return `${cookie.name}|${domain}|${cookie.path}`;
  }

  /**
   * Checks if cookie's domain matches the request hostname (RFC 6265 Section 5.1.3).
   */
  private isDomainMatch(cookie: Cookie, hostname: string): boolean {
    if (cookie.domain) {
      return (
        hostname === cookie.domain || hostname.endsWith(`.${cookie.domain}`)
      );
    }
    return hostname === cookie.originHost;
  }

  /**
   * Checks if cookie's path matches the request path (RFC 6265 Section 5.1.4).
   */
  private isPathMatch(cookie: Cookie, requestPath: string): boolean {
    return requestPath.startsWith(cookie.path);
  }

  /**
   * Checks if cookie's Secure flag is satisfied (RFC 6265 Section 5.4).
   */
  private isSecurityMatch(cookie: Cookie, protocol: string): boolean {
    return !cookie.secure || protocol === "https:";
  }

  /**
   * Gets the Cookie header value for a request URL (RFC 6265 Section 5.4).
   */
  private getCookieHeader(url: string): string {
    const { hostname, pathname, protocol } = new URL(url);
    const matchingCookies = Array.from(this.cookies.values())
      .filter(
        (cookie) =>
          this.isDomainMatch(cookie, hostname) &&
          this.isPathMatch(cookie, pathname) &&
          this.isSecurityMatch(cookie, protocol)
      )
      .sort((a, b) => {
        if (a.path.length !== b.path.length) {
          return b.path.length - a.path.length;
        }
        return a.creationIndex - b.creationIndex;
      });
    return matchingCookies.map((c) => `${c.name}=${c.value}`).join("; ");
  }

  private findCookieByName(name: string): Cookie | undefined {
    return Array.from(this.cookies.values()).find(
      (cookie) => cookie.name === name
    );
  }

  private async followRedirects(
    url: string,
    options: AxiosRequestConfig = {}
  ): Promise<any> {
    let currentUrl = url;
    let redirectCount = 0;
    const maxRedirects = 20;

    while (redirectCount < maxRedirects) {
      const response = await this.httpClient({
        ...options,
        url: currentUrl,
        headers: {
          ...this.DEFAULT_HEADERS,
          ...options.headers,
        },
      });

      const location = response.headers["location"];
      const isRedirect = response.status >= 300 && response.status < 400;

      if (location && isRedirect) {
        currentUrl = new URL(location, currentUrl).toString();
        redirectCount++;

        if ([301, 302, 303].includes(response.status)) {
          options.method = "GET";
          delete options.data;
        }
        continue;
      }

      return response;
    }

    throw new Error("Too many redirects");
  }

  /**
   * Authenticates with the MonLycee platform.
   * 
   * @param credentials - User authentication credentials
   * @returns Promise that resolves when login is complete
   */
  async login(credentials: AuthCredentials): Promise<void> {
    const { data: html } = await this.followRedirects(this.BASE_PSN_URL, {
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

    await this.followRedirects(formActionUrl, {
      method: "POST",
      data: loginPayload.toString(),
      headers: {
        Origin: "null",
        "Cache-Control": "max-age=0",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    await this.httpClient.post(`${this.BASE_WEBMAIL_API_URL}getVersion.json`, "", {
      headers: {
        ...this.DEFAULT_HEADERS,
        Referer: this.BASE_PSN_URL,
        Origin: "https://psn.monlycee.net",
      },
    });
    /*
    {"response": {
      "status": {
          "code": 481,
          "mnemo": "CSRFTOKEN_INVALID"
      }
    }}
    */

    const { data: csrfData } = await this.httpClient.post(
      `${this.BASE_WEBMAIL_API_URL}createToken.json`,
      "",
      {
        headers: {
          ...this.DEFAULT_HEADERS,
          Referer: this.BASE_PSN_URL,
          Origin: "https://psn.monlycee.net",
        },
      }
    );

    const csrfToken = csrfData?.response?.tokenValue;
    if (!csrfToken) {
      throw new Error("Failed to obtain CSRF token");
    }

    this.cookies.set("CSRF_TOKEN|monlycee.net|/", {
      name: "CSRF_TOKEN",
      value: csrfToken,
      path: "/",
      domain: "monlycee.net",
      originHost: "apis-mail.monlycee.net",
      creationIndex: this.creationCounter++,
      expires: null,
      secure: false,
      httpOnly: false,
      sameSite: null,
    });

    await this.followRedirects(
      `${this.BASE_ENT_URL}auth/openid/login?callBack=https%3A%2F%2Fent.monlycee.net%2Fwelcome`,
      {
        method: "GET",
        headers: {
          Referer: this.BASE_PSN_URL,
          Priority: "u=0, i",
        },
      }
    );
  }

  /**
   * Retrieves a list of email headers from the user's mailbox.
   * 
   * @param options - Options for retrieving emails (folder, sort order, pagination)
   * @returns Array of email header objects
   */
  async getMails({ folder = "SF_INBOX", sortBy = "dateDesc", page = 1, perPage = 30 }: GetMailsOptions = {}): Promise<any> {
    const csrfToken = this.findCookieByName("CSRF_TOKEN")?.value;

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
      `${this.BASE_WEBMAIL_API_URL}getMailHeaderList.json`,
      payload.toString(),
      {
        headers: {
          ...this.DEFAULT_HEADERS,
          Referer: "https://web-mail.monlycee.net/",
          Origin: "https://web-mail.monlycee.net",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      }
    );
    return mailsData.response.mailHeader;
  }
}
