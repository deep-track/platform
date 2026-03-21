# BACKEND_CONTRACT

This document lists backend/API endpoints called by the frontend codebase, based on direct code inspection.

Status legend:
- ✅ Working — confirmed working in dev
- ⚠️ Returns 503 — backend not available
- ❓ Untested — no evidence of being tested
- 🆕 New — added for KYC feature, backend endpoint does not exist yet

---

## AUTH Endpoints

### POST `/auth/login`
- **Called from**: `app/api/auth/login/route.ts` line ~10
- **Purpose**: Legacy login flow; exchanges `email/password/terms` for tokens + user
- **Request body**: `{ email, password, terms }`
- **Expected response**: `{ accessToken, refreshToken, user }`
- **Auth**: None
- **Used by**: No direct caller to `/api/auth/login` found in current app code
- **Status**: ❓ Untested

### POST `/auth/signout`
- **Called from**: `app/api/auth/signout/route.ts` line ~16
- **Purpose**: Legacy signout against external auth API
- **Request body**: `{ id: session.user.id }`
- **Expected response**: success (`2xx`), then local session cookie is deleted
- **Auth**: Bearer token via `lib/authFetch.ts` (`Authorization: Bearer <session.accessToken>`)
- **Used by**: `components/app-si.tsx` line ~74 (`fetch('/api/auth/signout')`)
- **Status**: ❓ Untested

### POST `/auth/refresh-token`
- **Called from**: `lib/authFetch.ts` line ~37 (as relative `/auth/refresh-token`)
- **Purpose**: Refresh access token when a protected request returns `401`
- **Request body**: `{ refreshToken }`
- **Expected response**: `{ accessToken }`
- **Auth**: None in request body-driven refresh
- **Used by**: `app/api/auth/signout/route.ts` through `authFetch(...)`
- **Status**: ❓ Untested
- **Note**: No `app/api/auth/refresh-token/route.ts` exists in repo.

### GET `/api/auth/current-user` (local Next API)
- **Called from**: `app/api/auth/current-user/route.ts` line ~5
- **Purpose**: Return current legacy session user from cookie
- **Request body**: none
- **Expected response**: `{ user: session.user | null }`
- **Auth**: Cookie session (`session`)
- **Used by**: No callers found
- **Status**: ❓ Untested

### POST `/api/auth/update-token` (local Next API)
- **Called from**: `app/api/auth/update-token/route.ts` line ~5
- **Purpose**: Update legacy cookie session tokens
- **Request body**: `{ accessToken, refreshToken }`
- **Expected response**: text `OK` on success
- **Auth**: Cookie session update path
- **Used by**: No callers found
- **Status**: ❓ Untested

---

## USER Endpoints

### POST `/v1/users/add`
- **Called from**: `actions/auth-actions.ts` line ~50
- **Purpose**: Create/register DB user record after Auth0 identity exists
- **Request body**: `{ userId, email, role, companyId, fullName }`
- **Expected response**: `{ status, message, data? }` where `data` matches `BackendUser`
- **Auth**: None added in this action (JSON only)
- **Used by**: `app/(onboard)/new-user/page.tsx` line ~19, `app/(onboard)/new-org/page.tsx` line ~15
- **Status**: ⚠️ Returns 503 — backend not available

### GET `/v1/users/{lookupPath}/{userId}`
- **Called from**: `actions/auth-actions.ts` line ~139
- **Purpose**: Resolve app user by identity provider user id
- **Request path variants**:
  - `DEEPTRACK_USER_LOOKUP_PATH` (if set)
  - `find-by-auth0`
  - `find-by-clerk`
  - `find-by-external`
- **Expected response**: `{ status, message, data? }` where `data` is `BackendUser`
- **Auth**: None added in this action
- **Used by**:
  - `app/(onboard)/new-user/page.tsx` line ~15
  - `app/(onboard)/new-org/page.tsx` line ~13
  - `app/(platform)/api-keys/page.tsx` line ~11
  - `lib/actions.ts` lines ~18/~57/~92
- **Status**: ⚠️ Returns 503 — backend not available

---

## ORGANIZATION Endpoints

### POST `/v1/companies`
- **Called from**: `actions/organization.ts` line ~19
- **Purpose**: Create organization/company
- **Request body**: `{ name, email, phone, companyHeadId, companyDomain }`
- **Expected response**: company payload (action wraps as `{ status: 200, data, message }`)
- **Auth**: None added in this action
- **Used by**:
  - `modules/organization/create-organization-form.tsx` line ~82
  - `modules/organization/create-organization.tsx` line ~80
- **Status**: ❓ Untested

### GET `/v1/companies/find-company/{userId}`
- **Called from**: `actions/organization.ts` line ~60
- **Purpose**: Check if user already has a company
- **Request body**: none
- **Expected response**: `{ company: boolean }`
- **Auth**: None added in this action
- **Used by**: `app/(onboard)/new-org/page.tsx` line ~26
- **Status**: ❓ Untested

### GET `/v1/companies/by-head/{userId}`
- **Called from**: `actions/organization.ts` line ~84
- **Purpose**: Fetch company details by company head user id
- **Request body**: none
- **Expected response**: `CompanyWithMembers`
- **Auth**: None added in this action
- **Used by**: `app/(platform)/members/page.tsx` line ~17
- **Status**: ❓ Untested

### GET `/v1/companies/check-head/{userId}`
- **Called from**: `actions/organization.ts` line ~125 via `BACKEND_URLS["Check if Company Head"]`
- **Purpose**: Check whether user is company head
- **Request body**: none
- **Expected response**: `{ head: boolean }`
- **Auth**: None added in this action
- **Used by**: `app/(platform)/members/page.tsx` line ~19
- **Status**: ❓ Untested

### GET `/v1/users/company-members/{userId}`
- **Called from**: `actions/organization.ts` line ~149 via `BACKEND_URLS["Get All Company Members"]`
- **Purpose**: List company members for a user’s company
- **Request body**: none
- **Expected response**: `CompanyMember[]`
- **Auth**: None added in this action
- **Used by**: `app/(platform)/members/page.tsx` line ~18
- **Status**: ❓ Untested

---

## API KEY Endpoints

### GET `/v1/users/api-keys/{userId}/{companyId}`
- **Called from**:
  - `actions/api-keys.ts` line ~26
  - `lib/actions.ts` line ~67
- **Purpose**: List API keys for user/company
- **Request body**: none
- **Expected response**: `APIKey[]`
- **Auth**: None added in these actions
- **Used by**:
  - `app/(platform)/api-keys/page.tsx` line ~15 (via `actions/api-keys.ts`)
  - `lib/actions.ts` internal use in `verifyIdentityServerSide`
- **Status**: ❓ Untested

### POST `/v1/users/api-keys/create`
- **Called from**:
  - `actions/api-keys.ts` line ~54
  - `lib/actions.ts` line ~28
- **Purpose**: Create a new API key
- **Request body**:
  - `actions/api-keys.ts`: `{ name, companyId, userId }`
  - `lib/actions.ts`: `{ userId, companyId }`
- **Expected response**: created `APIKey` payload (contains key value)
- **Auth**: None added in these actions
- **Used by**:
  - `app/(platform)/api-keys/create-api-key-form.tsx` line ~53 (via `actions/api-keys.ts`)
  - `lib/actions.ts` direct server action (no external usage found)
- **Status**: ❓ Untested

### PATCH `/v1/users/api-keys/{apiKeyId}/revoke`
- **Called from**: `actions/api-keys.ts` line ~81
- **Purpose**: Revoke an API key
- **Request body**: `{ userId, companyId }`
- **Expected response**: non-error status (`2xx`) interpreted as success
- **Auth**: None added in this action
- **Used by**: `app/(platform)/api-keys/revoke-api-key.tsx` line ~36
- **Status**: ❓ Untested

### POST `/users/{userId}/create-apikey` (legacy external API)
- **Called from**: `app/(platform)/_components/apiKey-generator.tsx` line ~40
- **Purpose**: Legacy client-side API key generation
- **Request body**: `{ ownerId }`
- **Expected response**: `{ apiKey }`
- **Auth**: Bearer token from legacy `getSession()` (`Authorization` header)
- **Used by**: `app/(platform)/_components/apiKey-generator.tsx`
- **Status**: ❓ Untested

---

## KYC Endpoints

### POST `/v1/kyc`
- **Called from**: `actions/kyc.ts` line ~69
- **Purpose**: Create a KYC record after creating a Shufti verification request
- **Request body**: `{ reference, userId, personalInfo, documentType, documentFrontUrl, documentBackUrl, selfieUrl, status, shuftiEventType, shuftiVerificationUrl, invitationToken }`
- **Expected response**: object containing created id (`data.id` used)
- **Auth**: Bearer token if available from `getAuth()` (`actions/kyc.ts` `authHeaders`)
- **Used by**: `modules/kyc/kyc-wizard.tsx` line ~57
- **Status**: 🆕 New — added for KYC feature, backend endpoint not confirmed

### GET `/v1/kyc?status=&page=&limit=`
- **Called from**: `actions/kyc.ts` line ~127
- **Purpose**: List KYC records
- **Query params**: `status`, `page`, `limit`
- **Expected response**: `{ records: KYCRecord[], total: number }`
- **Auth**: Bearer token if available
- **Used by**: `app/(platform)/kyc/page.tsx` line ~47
- **Status**: ⚠️ Returns 503 — backend not available

### GET `/v1/kyc/stats`
- **Called from**: `actions/kyc.ts` line ~291
- **Purpose**: Fetch KYC dashboard statistics
- **Request body**: none
- **Expected response**: `{ total, approved, declined, pending, processing, requires_review }`
- **Auth**: Bearer token if available
- **Used by**: `app/(platform)/kyc/page.tsx` line ~47
- **Status**: ⚠️ Returns 503 — backend not available

### GET `/v1/kyc/{id}`
- **Called from**: `actions/kyc.ts` line ~150
- **Purpose**: Fetch KYC record details
- **Request body**: none
- **Expected response**: `KYCRecord`
- **Auth**: Bearer token if available
- **Used by**:
  - `app/(platform)/kyc/[id]/page.tsx` line ~51
  - `app/(platform)/kyc/[id]/review/page.tsx` line ~12
- **Status**: 🆕 New — added for KYC feature, backend endpoint not confirmed

### GET `/v1/kyc/me?userId={id}`
- **Called from**: `actions/kyc.ts` line ~170
- **Purpose**: Fetch current user’s KYC
- **Query params**: `userId`
- **Expected response**: `KYCRecord` or `404` interpreted as `null`
- **Auth**: Bearer token if available
- **Used by**: No usages found
- **Status**: 🆕 New — added for KYC feature, backend endpoint not confirmed

### PATCH `/v1/kyc/{id}`
- **Called from**: `actions/kyc.ts` line ~194
- **Purpose**: Update KYC status from latest Shufti status pull
- **Request body**: `{ status, shuftiEventType }`
- **Expected response**: updated `KYCRecord`
- **Auth**: Bearer token if available
- **Used by**: `app/(platform)/kyc/[id]/page.tsx` line ~78 (refresh action)
- **Status**: 🆕 New — added for KYC feature, backend endpoint not confirmed

### POST `/v1/kyc/{id}/review`
- **Called from**: `actions/kyc.ts` line ~220
- **Purpose**: Submit manual review decision
- **Request body**: `{ status: "approved" | "declined", reviewNotes, declineReason }`
- **Expected response**: updated `KYCRecord`
- **Auth**: Bearer token if available
- **Used by**: `app/(platform)/kyc/[id]/review/_components/kyc-review-client.tsx` line ~61
- **Status**: 🆕 New — added for KYC feature, backend endpoint not confirmed

### POST `/v1/kyc/invitations`
- **Called from**: `actions/kyc.ts` line ~248
- **Purpose**: Invite user to KYC flow
- **Request body**: `{ email, name, invitedBy }`
- **Expected response**: `KYCInvitation`
- **Auth**: Bearer token if available
- **Used by**: `app/(platform)/kyc/_components/invite-user-dialog.tsx` line ~47
- **Status**: 🆕 New — added for KYC feature, backend endpoint not confirmed

### PATCH `/v1/kyc/by-reference/{reference}`
- **Called from**: `app/api/webhooks/shufti/route.ts` line ~24
- **Purpose**: Webhook callback upsert/update by Shufti reference
- **Request body**: `{ status, shuftiEventType, declineReason, verificationResult }`
- **Expected response**: success (`2xx`), errors logged but webhook still returns `{ received: true }`
- **Auth**: Bearer token from `DEEPTRACK_INTERNAL_TOKEN`
- **Used by**: Shufti webhook delivery to `POST /api/webhooks/shufti`
- **Status**: 🆕 New — added for KYC feature, backend endpoint not confirmed

### POST `/v1/kyc/deeptrackai-id` (legacy verification flow)
- **Called from**: `lib/actions.ts` line ~115
- **Purpose**: Legacy ID verification pipeline
- **Request body**: `{ face_Image, front_id_Image, back_id_Image }`
- **Expected response**: verification result payload consumed by UI
- **Auth**: `x-api-key` header (active key from API key list)
- **Used by**: `app/(platform)/_components/verifications/verify-id-form.tsx` line ~102
- **Status**: ❓ Untested

---

## THIRD-PARTY / INTERNAL SERVICE Endpoints (not `DEEPTRACK_BACKEND_URL`)

### POST `https://api.shuftipro.com/`
- **Called from**: `lib/shufti.ts` line ~68
- **Purpose**: Create Shufti verification request
- **Request body**: `ShuftiVerificationRequest`
- **Expected response**: `ShuftiResponse` (includes `event`, optional `verification_url`)
- **Auth**: Basic auth (`SHUFTI_CLIENT_ID:SHUFTI_SECRET_KEY`)
- **Used by**: `actions/kyc.ts` `submitKYC`
- **Status**: ❓ Untested

### POST `https://api.shuftipro.com/status`
- **Called from**: `lib/shufti.ts` line ~89
- **Purpose**: Poll Shufti status by reference
- **Request body**: `{ reference }`
- **Expected response**: `ShuftiResponse`
- **Auth**: Basic auth
- **Used by**: `actions/kyc.ts` `refreshKYCFromShufti`
- **Status**: ❓ Untested

### POST `https://api.shuftipro.com/delete`
- **Called from**: `lib/shufti.ts` line ~108
- **Purpose**: Delete/cancel Shufti verification
- **Request body**: `{ reference }`
- **Expected response**: no body required on success
- **Auth**: Basic auth
- **Used by**: no usages found
- **Status**: ❓ Untested

### POST `/api/uploadthing` (local Next route)
- **Called from**:
  - `modules/kyc/steps/document-upload-step.tsx` line ~68
  - `modules/kyc/steps/selfie-step.tsx` line ~32
- **Purpose**: Upload document/selfie files and receive public URLs
- **Request body**: multipart `FormData` with `file`
- **Expected response**: `{ url }` or array element with `url`
- **Auth**: none in caller
- **Used by**: KYC wizard document and selfie steps
- **Status**: ❓ Untested

### GET `/aml/check-sanctions` (legacy AML API)
- **Called from**: `app/(platform)/_components/aml-check-components/aml-check-form.tsx` line ~80
- **Purpose**: Run sanctions/AML checks
- **Query params**: `{ fullName, birthDate, nationality }`
- **Expected response**: `VerificationResponse`
- **Auth**: `x-api-key` header
- **Used by**: AML check form UI
- **Status**: ❓ Untested
