import { MembershipLevel } from "./utils/authUtils";

declare module "next-auth" {
  interface Session {
    access_token?: string;
    id_token?: string;
    error?: string;
    username?: string;
    name?: string;
    roles?: string[];
    membershipLevel?: MembershipLevel | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    decoded?: Record<string, unknown>;
    access_token?: string;
    id_token?: string;
    refresh_token?: string;
    expires_at?: number;
    error?: string;
  }
}
