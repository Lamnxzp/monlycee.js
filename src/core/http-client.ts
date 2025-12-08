import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import https from "https";
import { CookieJar } from "./cookie-jar";
import { DEFAULT_HEADERS } from "./constants";

export class HttpClient {
  private axiosInstance: AxiosInstance;
  public cookieJar: CookieJar;

  constructor() {
    this.cookieJar = new CookieJar();
    this.axiosInstance = axios.create({
      httpsAgent: new https.Agent({
        keepAlive: true,
        minVersion: "TLSv1.2",
      }),
      maxRedirects: 0,
      validateStatus: () => true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Interceptor to add cookies to requests
    this.axiosInstance.interceptors.request.use((config) => {
      const cookieHeader = this.cookieJar.getCookieHeader(config.url || "");
      if (cookieHeader) {
        config.headers.Cookie = cookieHeader;
      }
      return config;
    });

    // Interceptor to update cookies from responses
    this.axiosInstance.interceptors.response.use((response) => {
      const setCookies = response.headers["set-cookie"];
      if (setCookies && response.config.url) {
        const originHost = new URL(response.config.url).hostname;
        const newCookies = this.cookieJar.parseCookies(
          Array.isArray(setCookies) ? setCookies : [setCookies],
          originHost
        );
        this.cookieJar.addCookies(newCookies);
      }
      return response;
    });
  }

  public async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.request(config);
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get(url, config);
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post(url, data, config);
  }

  public async followRedirects(
    url: string,
    options: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<any>> {
    let currentUrl = url;
    let redirectCount = 0;
    const maxRedirects = 20;

    while (redirectCount < maxRedirects) {
      const response = await this.axiosInstance({
        ...options,
        url: currentUrl,
        headers: {
          ...DEFAULT_HEADERS,
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
}
