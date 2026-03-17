# Auth0 Setup Guide

This project has been migrated from Clerk to Auth0.

## 1) Create/Auth0 app
- Create an **Auth0 Regular Web Application**.
- Save:
  - `Domain`
  - `Client ID`
  - `Client Secret`

## 2) Configure application URLs
In Auth0 application settings:
- **Allowed Callback URLs**:
  - `http://localhost:3000/auth/callback`
- **Allowed Logout URLs**:
  - `http://localhost:3000`
- **Allowed Web Origins**:
  - `http://localhost:3000`

If you have staging/prod domains, add those equivalents too.

## 3) Add local environment variables
Create a local `.env` (or update it) with:

```bash
AUTH0_SECRET=replace_with_32_byte_hex_or_base64_secret
APP_BASE_URL=http://localhost:3000
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret

# Optional API token settings (if you call protected APIs)
AUTH0_AUDIENCE=
AUTH0_SCOPE=openid profile email

# Custom claim names used by this codebase
AUTH0_ROLE_CLAIM=https://deeptrack.io/role
AUTH0_COMPANY_ID_CLAIM=https://deeptrack.io/companyId

# Existing backend integration
DEEPTRACK_BACKEND_URL=your_backend_base_url

# Backend lookup endpoint segment for user lookup
# Example values: find-by-clerk, find-by-auth0, find-by-external
DEEPTRACK_USER_LOOKUP_PATH=find-by-clerk

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4) Add custom claims in Auth0 tokens
This app expects user role/company values from custom claims:
- Role claim key: `https://deeptrack.io/role`
- Company claim key: `https://deeptrack.io/companyId`

Use an Auth0 Action (Post Login) to inject these claims into ID/access tokens.

## 5) Backend compatibility requirement
Frontend now sends Auth0 user ids (`sub`, e.g. `auth0|abc123`) when calling user APIs.

Your backend user lookup must accept that ID format at:
- `GET /v1/users/{DEEPTRACK_USER_LOOKUP_PATH}/{userId}`

If backend route name differs, set `DEEPTRACK_USER_LOOKUP_PATH` accordingly.

## 6) Auth route behavior in this app
- Login: `/auth/login`
- Signup: `/auth/login?screen_hint=signup`
- Logout: `/auth/logout`

These are served by `app/auth/[auth0]/route.ts`.

## 7) Invitations (important)
Clerk invitation API has no direct drop-in equivalent here yet.
Current `actions/invitations.ts` intentionally throws until Auth0 Organizations invitation wiring is added.

To fully restore invitations, you need:
- Auth0 Organizations enabled
- Mapping between your `companyId` and Auth0 `organization_id`
- Management API M2M app + scopes:
  - `create:organization_invitations`
  - `delete:organization_invitations`
  - `read:organizations`

Then implement invitation create/revoke via Auth0 Management API.
