import crypto from "node:crypto";

const SHUFTI_API_URL = "https://api.shuftipro.com/";

export type ShuftiDocumentType = "passport" | "id_card" | "driving_license";

export type ShuftiVerificationRequest = {
  reference: string;
  callback_url: string;
  redirect_url?: string;
  country: string;
  language: string;
  email: string;
  verification_mode: "image_only" | "video" | "any";
  document?: {
    proof: string;
    additional_proof?: string;
    supported_types: ShuftiDocumentType[];
    name?: {
      first_name?: string;
      last_name?: string;
      middle_name?: string;
    };
    dob?: string;
    gender?: string;
    document_number?: string;
    expiry_date?: string;
    issue_date?: string;
  };
  face?: {
    proof: string;
    allow_offline?: boolean;
    allow_online?: boolean;
  };
};

export type ShuftiResponse = {
  reference: string;
  event:
    | "request.received"
    | "request.pending"
    | "verification.accepted"
    | "verification.declined"
    | "error"
    | string;
  error?: {
    service: string;
    key: string;
    message: string | Record<string, string[]>;
  };
  verification_url?: string;
  token?: string;
};

function getAuthHeader(): string {
  const clientId = process.env.SHUFTI_CLIENT_ID;
  const secretKey = process.env.SHUFTI_SECRET_KEY;

  if (!clientId || !secretKey) {
    throw new Error("Missing SHUFTI_CLIENT_ID or SHUFTI_SECRET_KEY environment variables");
  }

  const credentials = Buffer.from(`${clientId}:${secretKey}`).toString("base64");
  return `Basic ${credentials}`;
}

export async function createShuftiVerification(
  request: ShuftiVerificationRequest,
): Promise<ShuftiResponse> {
  const response = await fetch(SHUFTI_API_URL, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shufti Pro API error ${response.status}: ${text}`);
  }

  return response.json() as Promise<ShuftiResponse>;
}

export async function getShuftiVerificationStatus(
  reference: string,
): Promise<ShuftiResponse> {
  const response = await fetch(`${SHUFTI_API_URL}status`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ reference }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shufti Pro status check error ${response.status}: ${text}`);
  }

  return response.json() as Promise<ShuftiResponse>;
}

export async function deleteShuftiVerification(reference: string): Promise<void> {
  const response = await fetch(`${SHUFTI_API_URL}delete`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ reference }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shufti Pro delete error ${response.status}: ${text}`);
  }
}

export function buildShuftiRequest(params: {
  reference: string;
  email: string;
  country: string;
  documentType: ShuftiDocumentType;
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: string;
  documentNumber?: string;
  expiryDate?: string;
  issueDate?: string;
}): ShuftiVerificationRequest {
  const appUrl = (
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://platform-one-sable.vercel.app"
  ).replace(/\/$/, "");
  const callbackUrl = `${appUrl}/api/webhooks/shufti`;
  console.log("[Shufti] Building request with callback_url:", callbackUrl);

  return {
    reference: params.reference,
    callback_url: callbackUrl,
    country: params.country.toUpperCase().slice(0, 2),
    language: "EN",
    email: params.email,
    verification_mode: "any",
    document: {
      proof: params.documentFrontUrl,
      ...(params.documentBackUrl && {
        additional_proof: params.documentBackUrl,
      }),
      supported_types: [params.documentType],
      name: {
        first_name: params.firstName,
        last_name: params.lastName,
        middle_name: params.middleName,
      },
      dob: params.dateOfBirth,
      gender: params.gender,
      document_number: params.documentNumber,
      expiry_date: params.expiryDate,
      issue_date: params.issueDate,
    },
    face: {
      proof: params.selfieUrl ?? "",
      allow_offline: true,
      allow_online: true,
    },
  };
}

export function verifyShuftiWebhookSignature(
  payload: string,
  receivedSignature: string | null,
): boolean {
  if (!receivedSignature) return false;

  const secretKey = process.env.SHUFTI_SECRET_KEY;
  if (!secretKey) return false;

  const expectedSig = crypto.createHmac("sha256", secretKey).update(payload).digest("hex");

  if (receivedSignature.length !== expectedSig.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(expectedSig));
}

export function mapShuftiEventToStatus(event: string): string {
  switch (event) {
    case "verification.accepted":
      return "approved";
    case "verification.declined":
      return "declined";
    case "review.pending":
      return "requires_review";
    case "review.accepted":
      return "approved";
    case "review.declined":
      return "declined";
    case "request.received":
    case "request.pending":
      return "processing";
    case "request.timeout":
    case "request.deleted":
      return "expired";
    default:
      return "processing";
  }
}
