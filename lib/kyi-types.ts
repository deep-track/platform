import { z } from "zod";

export const investorProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["M", "F", "O"]).optional(),
  nationality: z.string().min(2, "Nationality is required"),
  countryOfResidence: z.string().min(2, "Country of residence is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone required"),
  investorType: z.enum(
    [
      "individual",
      "joint",
      "corporate",
      "fund",
      "trust",
      "pension_fund",
      "family_office",
    ],
    { required_error: "Investor type is required" },
  ),
  accreditationStatus: z.enum(
    ["accredited", "qualified", "institutional", "retail"],
    { required_error: "Accreditation status is required" },
  ),
  investmentAmount: z.string().min(1, "Investment amount is required"),
  investmentCurrency: z.string().default("USD"),
  sourceOfFunds: z.enum(
    [
      "employment_income",
      "business_income",
      "investment_returns",
      "inheritance",
      "property_sale",
      "savings",
      "other",
    ],
    { required_error: "Source of funds is required" },
  ),
  sourceOfFundsDetails: z.string().optional(),
  isPEP: z.boolean().default(false),
  pepDetails: z.string().optional(),
  hasCriminalRecord: z.boolean().default(false),
  criminalRecordDetails: z.string().optional(),
  address: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().min(2, "Country is required"),
  }),
});

export const investorDocumentsSchema = z.object({
  // Government ID
  governmentIdUrl: z.string().min(1, "Government ID is required"),
  governmentIdBase64: z.string().min(1, "Government ID image data required"),
  governmentIdType: z.enum(["passport", "national_id", "driving_license"]),
  // Selfie
  selfieUrl: z.string().min(1, "Selfie is required"),
  selfieBase64: z.string().min(1, "Selfie image data required"),
  // Financial proof
  bankStatementUrl: z.string().min(1, "Bank statement is required"),
  proofOfNetWorthUrl: z.string().optional(),
  accreditationLetterUrl: z.string().optional(),
  sourceOfFundsDocUrl: z.string().optional(),
  proofOfAddressUrl: z.string().min(1, "Proof of address is required"),
  corporateDocUrl: z.string().optional(),
});

export type InvestorProfileData = z.infer<typeof investorProfileSchema>;
export type InvestorDocumentsData = z.infer<typeof investorDocumentsSchema>;

export type KYIWizardData = {
  investorProfile?: InvestorProfileData;
  documents?: InvestorDocumentsData;
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
  status: KYIStatus;
  investorProfile: InvestorProfileData;
  documents: InvestorDocumentsData;
  isPEP: boolean;
  accreditationStatus: string;
  investorType: string;
  investmentAmount: string;
  sourceOfFunds: string;
  riskScore?: number;
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
  investorName?: string;
  invitedBy: string;
  token: string;
  status: "pending" | "in_progress" | "completed" | "expired";
  expiresAt: string;
  createdAt: string;
};

export type KYISubmitPayload = {
  investorProfile: InvestorProfileData;
  documents: InvestorDocumentsData;
  invitationToken?: string;
};

export type KYIActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
