import { signOut } from "next-auth/react";

export type MembershipLevel = "SILVER" | "GOLD" | "PLATINUM";

export interface SessionData {
  user?: {
    name?: string;
    email?: string;
  };
  expires: string;
  access_token: string;
  id_token: string;
  error?: string;
  username?: string;
  name?: string;
  roles?: string[];
  membershipLevel?: MembershipLevel | null;
}

/**
 * Ends the Keycloak SSO session (so the next login isn't silently re-authenticated),
 * then clears the local NextAuth session.
 */
export const keycloakSessionLogOut = async (idToken?: string) => {
  const endSessionUrl = process.env.NEXT_PUBLIC_KEYCLOAK_END_SESSION_URL;
  try {
    if (endSessionUrl) {
      const postLogoutRedirectUri = window.location.origin;
      const url = `${endSessionUrl}?id_token_hint=${idToken ?? ""}&post_logout_redirect_uri=${postLogoutRedirectUri}`;
      await fetch(url);
    }
  } catch (err) {
    console.error("Keycloak logout failed", err);
  } finally {
    await signOut({ callbackUrl: "/" });
  }
};
