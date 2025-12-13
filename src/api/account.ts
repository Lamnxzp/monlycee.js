import { HttpClient } from "../core/http-client";
import { AuthCredentials } from "../types";
import {
  BASE_PSN_URL,
  BASE_WEBMAIL_API_URL,
  BASE_ENT_URL,
  DEFAULT_HEADERS,
} from "../core/constants";

export class AccountService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Fetches the authenticated user's information from the ENT API.
   * @returns Promise resolving to the user information object.
   */
  async getUserInfo(): Promise<any> {
    const response = await this.httpClient.get(
      `${BASE_ENT_URL}auth/oauth2/userinfo`,
      {
        headers: {
          ...DEFAULT_HEADERS,
          Referer: BASE_ENT_URL,
        },
      }
    );

    return response.data;
  }

  /**
   * Fetches the user's profile from the PSN API
   * @remarks The `typeLabel` field may contain replacement characters (�) due to server-side encoding issues.
   * @returns Promise resolving to the profile object.
   */
  async getProfile(): Promise<any> {
    const response = await this.httpClient.get(`${BASE_PSN_URL}user/profile`, {
      headers: {
        ...DEFAULT_HEADERS,
        Referer: BASE_PSN_URL,
      },
    });

    // typeLabel contains � (EF BF BD) from server-side corruption.

    return response.data;
  }
}
