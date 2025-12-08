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
