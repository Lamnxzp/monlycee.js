import { Cookie } from "./types";

export class CookieJar {
  private cookies: Map<string, Cookie> = new Map();
  private creationCounter: number = 0;

  /**
   * Parses Set-Cookie headers into cookie objects (RFC 6265).
   */
  public parseCookies(
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

  public addCookies(newCookies: Cookie[]): void {
    for (const cookie of newCookies) {
      if (cookie.value === "") {
        this.cookies.delete(this.getCookieKey(cookie));
      } else {
        this.cookies.set(this.getCookieKey(cookie), cookie);
      }
    }
  }

  public getCookieKey(cookie: Cookie): string {
    const domain = cookie.domain || cookie.originHost;
    return `${cookie.name}|${domain}|${cookie.path}`;
  }

  public isDomainMatch(cookie: Cookie, hostname: string): boolean {
    if (cookie.domain) {
      return (
        hostname === cookie.domain || hostname.endsWith(`.${cookie.domain}`)
      );
    }
    return hostname === cookie.originHost;
  }

  public isPathMatch(cookie: Cookie, requestPath: string): boolean {
    return requestPath.startsWith(cookie.path);
  }

  public isSecurityMatch(cookie: Cookie, protocol: string): boolean {
    return !cookie.secure || protocol === "https:";
  }

  public getCookieHeader(url: string): string {
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

  public getCookie(name: string): Cookie | undefined {
    return Array.from(this.cookies.values()).find(
      (cookie) => cookie.name === name
    );
  }

  public addCookie(cookie: Cookie): void {
    if (cookie.value === "") {
      this.cookies.delete(this.getCookieKey(cookie));
    } else {
      this.cookies.set(this.getCookieKey(cookie), cookie);
    }
  }

  public getNextCreationIndex(): number {
    return this.creationCounter++;
  }
}
