# PRMS

Spaceship X26: Passenger Resource Management System — an Earth → Mars settlement mission
kata. Crew Leads (max 3) manage passengers, resources, and membership tiers; passengers
discover and use resources permitted by their tier (Silver/Gold/Platinum, higher tiers
inherit lower-tier access); every interaction is validated in real time and logged for
audit and reporting.

## Backend

Spring Boot REST API backed by PostgreSQL, with Keycloak handling authentication (JWTs
prove identity only — crew-lead/passenger role and membership level are resolved fresh
from our own DB on every request, since both change dynamically).

### Prerequisites

- JDK 17 (the build fails under newer JDKs — Lombok's annotation processor doesn't yet
  support JDK 25/26)
- Maven 3.9+ (developed against 3.9.16)
- Docker (for Postgres + Keycloak)

### Setup

```bash
cd backend
docker-compose up -d           # Postgres :6500, Keycloak :9080
mvn spring-boot:run             # http://localhost:8080
```

Or run `PrmsApplication` directly from your IDE — set the project SDK to JDK 17 and make
sure annotation processing is enabled (Lombok generates getters/builders/etc. at compile
time; the Lombok IDE plugin avoids false-positive red squiggles).

On first boot (skipped under the `test` profile), `ResourceSeeder`/`CrewLeadSeeder`/
`PassengerSeeder` populate the ship's base resource inventory and mirror the Keycloak
realm's seeded users into the app's own tables, so there's data to explore immediately:

| Username | Role | Membership level |
| --- | --- | --- |
| `so90667` | Crew Lead | — |
| `yg91185` | Crew Lead | — |
| `mh91004` | Crew Lead | — |
| `bn89820` | Passenger | SILVER |
| `mp89242` | Passenger | GOLD |
| `zc90663` | Passenger | PLATINUM |
All default user password is **abc123**

### API docs

Swagger UI: http://localhost:8080/swagger-ui.html — click **Authorize** and paste a
Keycloak-issued bearer token to call protected endpoints.

Get a token (client secret is in `backend/realm-config/RIFTKeycloak-realm.json`):

```bash
curl -s -X POST http://localhost:9080/auth/realms/RIFTKeycloak/protocol/openid-connect/token \
  -d 'grant_type=password' \
  -d 'client_id=rift-client' \
  -d 'client_secret=<from realm-config>' \
  -d 'username=so90667' \
  -d 'password=<the Keycloak password for that user>'
```

### Tests

```bash
mvn test
```

### Tech stack

Java 17 · Spring Boot 3.3 · Spring Security (OAuth2 Resource Server, JWT) · Spring Data
JPA · PostgreSQL · Lombok · MapStruct · springdoc-openapi (Swagger UI)

## Frontend

Next.js (Pages Router) frontend for the PRMS backend, authenticating against Keycloak via NextAuth.

### Prerequisites

- **Node.js 20** (`nvm use 20` — see `frontend/.nvmrc`). The build fails on Node 22+/24+:
  antd v5's ESM (`es/`) build uses extensionless imports that Node's newer "require of
  ESM" strictness rejects. `package.json` pins `engines.node` to `>=18 <21` as a guard.
- npm (bundled with Node)
- The PRMS backend and its Keycloak/Postgres running (refer to Backend > Setup)

### Setup

```bash
cd frontend
nvm use 20                     # or: nvm install 20
cp .env.example .env.local     # then fill in secrets (already populated for local dev)
npm install
npm run dev                    # http://localhost:3000
```

Open http://localhost:3000 — you'll be redirected to Keycloak. Log in with an existing
realm user (see the table above). Crew leads land on the Crew Lead Dashboard; passengers
land on the Passenger Portal.

### Configuration (`.env.local`)

| Var | Purpose |
| --- | --- |
| `NEXTAUTH_URL` / `NEXTAUTH_SECRET` | NextAuth base URL + cookie encryption secret |
| `KEYCLOAK_CLIENT_ID` / `_SECRET` / `_ISSUER` | Confidential Keycloak client (server-side only) |
| `KEYCLOAK_REFRESH_TOKEN_URL` | Token endpoint used to refresh expired access tokens |
| `NEXT_PUBLIC_KEYCLOAK_END_SESSION_URL` | Keycloak logout endpoint (browser, non-secret) |
| `NEXT_PUBLIC_API_BASE_URL` | PRMS backend base, e.g. `http://localhost:8080/api` |

### API client

`lib/open-api/` is an axios client generated from the backend's live OpenAPI spec (via
`openapi-typescript-codegen`). Regenerate it whenever the backend's API contract changes
(backend must be running on `:8080`):

```bash
npm run openapi:generate
```

### How auth works

- `pages/api/auth/[...nextauth].ts` — NextAuth + `KeycloakProvider`; `jwt` callback stores
  and refreshes tokens; `session` callback fetches `GET /api/users/me` for the caller's
  domain identity/roles.
- `middleware.ts` — protects every route by default.
- `component/auth/CheckSession.tsx` — pushes the access token into the generated client's
  `OpenAPI.TOKEN` config so every API call carries `Authorization: Bearer …`.

### Tech stack

Next.js 14 (Pages Router) · React 18 · TypeScript · Ant Design 5 · TanStack React Query 4 ·
NextAuth 4 · Chart.js 4 + react-chartjs-2 · openapi-typescript-codegen
