import { z } from "zod";

export const institutionInfoSchema = z.object({
  institutionName: z.string().min(1, "Institution name is required"),
  institutionType: z.enum([
    "bank",
    "ngo",
    "government",
    "university",
    "insurance",
    "microfinance",
    "sacco",
    "hospital",
    "other",
  ], { required_error: "Institution type is required" }),
  registrationNumber: z.string().min(1, "Registration number is required"),
  taxId: z.string().optional(),
  countryOfIncorporation: z.string().min(2, "Country is required"),
  dateOfIncorporation: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone number is required"),
  address: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().min(2, "Country is required"),
  }),
});

export const representativeInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone required"),
  nationalId: z.string().optional(),
});

export const institutionDocumentsSchema = z.object({
  certificateOfIncorporationUrl: z.string().min(1, "Certificate of incorporation is required"),
  memorandumUrl: z.string().optional(),
  taxCertificateUrl: z.string().optional(),
  regulatoryLicenseUrl: z.string().optional(),
  representativeIdUrl: z.string().min(1, "Representative ID is required"),
  proofOfAddressUrl: z.string().optional(),
});

export type InstitutionInfoData = z.infer<typeof institutionInfoSchema>;
export type RepresentativeInfoData = z.infer<typeof representativeInfoSchema>;
export type InstitutionDocumentsData = z.infer<typeof institutionDocumentsSchema>;

export type KYIWizardData = {
  institutionInfo?: InstitutionInfoData;
  representative?: RepresentativeInfoData;
  documents?: InstitutionDocumentsData;
};

export type KYIStatus =
  | "draft"
  | "pending"
  | "submitted"
  | "processing"
  | "approved"
  | "declined"
  | "requires_review"
  | "expired";

export type KYIRecord = {
  id: string;
  reference: string;
  userId: string;
  userEmail: string;
  userName: string;
  companyId?: string;
  status: KYIStatus;
  institutionInfo: InstitutionInfoData;
  representative: RepresentativeInfoData;
  documents: InstitutionDocumentsData;
  declineReason?: string;
  reviewNotes?: string;
  shuftiEventType?: string;
  shuftiVerificationUrl?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type KYIInvitation = {
  id: string;
  email: string;
  institutionName?: string;
  companyId: string;
  invitedBy: string;
  token: string;
  status: "pending" | "in_progress" | "completed" | "expired";
  expiresAt: string;
  createdAt: string;
};

export type KYISubmitPayload = {
  institutionInfo: InstitutionInfoData;
  representative: RepresentativeInfoData;
  documents: InstitutionDocumentsData;
  invitationToken?: string;
};

export type KYIActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
