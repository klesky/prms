# PRMS


## Frontend

Next.js (Pages Router) frontend for the PRMS backend, authenticating against Keycloak via NextAuth.

### Prerequisites

The PRMS backend and its Keycloak/Postgres must be running:

```bash
cd ../backend
docker-compose up -d          # Keycloak :9080, Postgres :6500
# then start the Spring Boot backend on :8080 (JDK 17)
```

### Setup

```bash
cp .env.example .env.local     # then fill in secrets (already populated for local dev)
npm install
npm run dev                    # http://localhost:3000
```

Open http://localhost:3000 — you'll be redirected to Keycloak. Log in with an existing
realm user (e.g. `so90667`). The home page then calls `GET /api/resources` with your
bearer token to confirm auth works end-to-end.

### Configuration (`.env.local`)

| Var | Purpose |
| --- | --- |
| `NEXTAUTH_URL` / `NEXTAUTH_SECRET` | NextAuth base URL + cookie encryption secret |
| `KEYCLOAK_CLIENT_ID` / `_SECRET` / `_ISSUER` | Confidential Keycloak client (server-side only) |
| `KEYCLOAK_REFRESH_TOKEN_URL` | Token endpoint used to refresh expired access tokens |
| `NEXT_PUBLIC_KEYCLOAK_END_SESSION_URL` | Keycloak logout endpoint (browser, non-secret) |
| `NEXT_PUBLIC_API_BASE_URL` | PRMS backend base, e.g. `http://localhost:8080/api` |

### How auth works

- `pages/api/auth/[...nextauth].ts` — NextAuth + `KeycloakProvider`; `jwt` callback stores
  and refreshes tokens; `session` callback fetches `GET /api/users/me` for the caller's
  domain identity/roles.
- `middleware.ts` — protects every route by default.
- `component/auth/CheckSession.tsx` + `lib/apiClient.ts` — push the access token into the
  axios client so client-side calls carry `Authorization: Bearer …`.
