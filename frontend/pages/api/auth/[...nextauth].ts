import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import jwt_decode from "jwt-decode";
import type { JWT } from "next-auth/jwt";
import type { CurrentUserDto } from "open-api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

// Refreshes an expired Keycloak access token using the stored refresh token.
async function refreshAccessToken(token: JWT): Promise<JWT> {
  const resp = await fetch(`${process.env.KEYCLOAK_REFRESH_TOKEN_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.KEYCLOAK_CLIENT_ID!,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: token.refresh_token!,
    }),
  });

  const refreshed = await resp.json();
  if (!resp.ok) throw refreshed;

  return {
    ...token,
    access_token: refreshed.access_token,
    decoded: jwt_decode(refreshed.access_token),
    id_token: refreshed.id_token,
    expires_at: Math.floor(Date.now() / 1000) + refreshed.expires_in,
    refresh_token: refreshed.refresh_token ?? token.refresh_token,
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: `${process.env.KEYCLOAK_CLIENT_ID}`,
      clientSecret: `${process.env.KEYCLOAK_CLIENT_SECRET}`,
      issuer: `${process.env.KEYCLOAK_ISSUER}`,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      const nowTimeStamp = Math.floor(Date.now() / 1000);
      if (account) {
        // First call after sign-in: persist the tokens onto the encrypted JWT.
        token.decoded = jwt_decode(account.access_token as string);
        token.access_token = account.access_token as string;
        token.id_token = account.id_token as string;
        token.expires_at = account.expires_at as number;
        token.refresh_token = account.refresh_token as string;
        return token;
      } else if (token.expires_at && nowTimeStamp < token.expires_at) {
        // Access token still valid.
        return token;
      } else {
        // Access token expired: refresh it.
        try {
          return await refreshAccessToken(token);
        } catch (error) {
          console.error("Error refreshing access token", error);
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }
    },
    async session({ session, token }) {
      session.access_token = token.access_token;
      session.id_token = token.id_token;
      session.error = token.error;

      // Fetch the caller's domain detail from the PRMS backend (server-side, no CORS needed).
      if (token.access_token && !token.error) {
        try {
          const res = await fetch(`${API_BASE}/users/me`, {
            headers: { Authorization: `Bearer ${token.access_token}` },
          });
          if (res.ok) {
            const me: CurrentUserDto = await res.json();
            session.username = me.username;
            session.name = me.name;
            session.roles = me.roles ?? [];
            session.membershipLevel = me.membershipLevel ?? null;
          } else {
            // Authenticated but backend rejected/failed — surface a role-less identity from the token.
            const decoded = token.decoded as Record<string, any> | undefined;
            session.username = decoded?.preferred_username;
            session.name = decoded?.name;
            session.roles = [];
            session.membershipLevel = null;
          }
        } catch (err) {
          console.error("Failed to fetch /users/me", err);
        }
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);
