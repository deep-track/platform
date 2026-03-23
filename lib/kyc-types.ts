import { z } from "zod";

export const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["M", "F", "O"], { required_error: "Gender is required" }),
  nationality: z.string().min(2, "Nationality is required"),
  email: z.string().email("A valid email is required"),
  phone: z.string().min(7, "Phone number is required"),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(2, "Country is required"),
  }),
});

export const documentUploadSchema = z.object({
  documentType: z.enum(["passport", "id_card", "driving_license"], {
    required_error: "Document type is required",
  }),
  // UploadThing URLs for database storage
  documentFrontUrl: z.string().min(1, "Front of document is required"),
  documentBackUrl: z.string().optional(),
  // Base64 for Shufti submission
  documentFrontBase64: z.string().min(1, "Front image data required"),
  documentBackBase64: z.string().optional(),
  documentNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  issueDate: z.string().optional(),
});

export const selfieSchema = z.object({
  // UploadThing URL for database storage
  selfieUrl: z.string().min(1, "Selfie is required"),
  // Base64 for Shufti submission
  selfieBase64: z.string().min(1, "Selfie image data required"),
  // true if video was recorded, false if photo
  isVideo: z.boolean().default(false),
});

export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
export type DocumentUploadData = z.infer<typeof documentUploadSchema>;
export type SelfieData = z.infer<typeof selfieSchema>;

export type KYCWizardData = {
  personalInfo?: PersonalInfoData;
  document?: DocumentUploadData;
  selfie?: SelfieData;
};

export type KYCStatus =
  | "draft"
  | "pending"
  | "submitted"
  | "processing"
  | "approved"
  | "declined"
  | "requires_review"
  | "expired";

export type KYCRecord = {
  id: string;
  reference: string;
  userId: string;
  userEmail: string;
  userName: string;
  companyId: string;
  status: KYCStatus;
  submittedAt?: string;
  reviewedAt?: string;
  expiresAt?: string;
  shuftiEventType?: string;
  shuftiVerificationUrl?: string;
  personalInfo: PersonalInfoData;
  documentType: string;
  documentFrontUrl?: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  declineReason?: string;
  reviewNotes?: string;
  riskScore?: number;
  createdAt: string;
  updatedAt: string;
};

export type KYCInvitation = {
  id: string;
  email: string;
  name?: string;
  companyId: string;
  invitedBy: string;
  token: string;
  status: "pending" | "in_progress" | "completed" | "expired";
  expiresAt: string;
  createdAt: string;
};

export type KYCSubmitPayload = {
  personalInfo: PersonalInfoData;
  document: DocumentUploadData;
  selfie: SelfieData;
  invitationToken?: string;
};

export type ShuftiWebhookPayload = {
  reference: string;
  event:
    | "request.received"
    | "request.pending"
    | "request.timeout"
    | "request.deleted"
    | "request.unauthorized"
    | "verification.accepted"
    | "verification.declined"
    | "verification.cancelled"
    | "review.pending"
    | "review.accepted"
    | "review.declined";
  verification_data?: Record<string, unknown>;
  verification_result?: Record<string, 0 | 1>;
  declined_reason?: string;
  info?: { agent?: Record<string, unknown>; geolocation?: Record<string, unknown> };
};

export type KYCActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
