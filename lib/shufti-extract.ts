/**
 * Shufti Pro Data Extraction Utility
 * 
 * Handles parsing and formatting of extracted document data from Shufti verification
 * Reads from TWO sources:
 *   - verification_data.document → basic OCR fields
 *   - additional_data.document.proof → enhanced fields
 *      (height, place_of_birth, authority, personal_number etc.)
 */

export type ShuftiDocumentBasic = {
  name?: {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
  };
  dob?: string;
  expiry_date?: string;
  issue_date?: string;
  document_number?: string;
  gender?: string;
  selected_type?: string[];
  nationality?: string;
  address?: string;
};

export type ShuftiDocumentEnhanced = {
  first_name?: string;
  last_name?: string;
  height?: string;
  country?: string;
  authority?: string;
  issue_date?: string;
  expiry_date?: string;
  nationality?: string;
  country_code?: string;
  document_type?: string;
  place_of_birth?: string;
  document_number?: string;
  personal_number?: string;
  dob?: string;
  age?: number | string;
  gender?: string;
};

export type ShuftiExtracted = {
  // From verification_data.document (standard OCR)
  basic: ShuftiDocumentBasic | null;
  // From additional_data.document.proof (enhanced OCR)
  enhanced: ShuftiDocumentEnhanced | null;
  // Merged best values from both sources
  firstName: string;
  lastName: string;
  middleName: string;
  fullName: string;
  dob: string;
  gender: string;
  nationality: string;
  documentNumber: string;
  expiryDate: string;
  issueDate: string;
  documentType: string;
  placeOfBirth: string;
  authority: string;
  age: string;
  country: string;
};

/**
 * Parse extracted data from BOTH Shufti sources
 * 
 * Reads:
 *   - extractedData = verification_data from webhook
 *   - additionalData = additional_data from webhook
 * 
 * Merges both, preferring enhanced data when available
 */
export function parseShuftiExtracted(
  extractedData: unknown,
  additionalData: unknown
): ShuftiExtracted {
  // Parse standard verification_data
  let basic: ShuftiDocumentBasic | null = null;
  if (extractedData && typeof extractedData === "object") {
    const d = extractedData as Record<string, unknown>;
    basic = (d.document as ShuftiDocumentBasic) ?? null;
  }

  // Parse additional_data.document.proof (enhanced)
  let enhanced: ShuftiDocumentEnhanced | null = null;
  if (additionalData && typeof additionalData === "object") {
    const ad = additionalData as Record<string, unknown>;
    const doc = ad.document as Record<string, unknown> | undefined;
    enhanced = (doc?.proof as ShuftiDocumentEnhanced) ?? null;
  }

  // Merge — prefer enhanced data when available
  const firstName =
    enhanced?.first_name ??
    basic?.name?.first_name ?? "";

  const lastName =
    enhanced?.last_name ??
    basic?.name?.last_name ?? "";

  const middleName = basic?.name?.middle_name ?? "";

  const fullName = [firstName, middleName, lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    basic,
    enhanced,
    firstName,
    lastName,
    middleName,
    fullName,
    dob: enhanced?.dob ?? basic?.dob ?? "",
    gender: enhanced?.gender ?? basic?.gender ?? "",
    nationality:
      enhanced?.nationality ?? basic?.nationality ?? "",
    documentNumber:
      enhanced?.document_number ?? basic?.document_number ?? "",
    expiryDate:
      enhanced?.expiry_date ?? basic?.expiry_date ?? "",
    issueDate:
      enhanced?.issue_date ?? basic?.issue_date ?? "",
    documentType:
      enhanced?.document_type ??
      basic?.selected_type?.[0] ?? "",
    placeOfBirth: enhanced?.place_of_birth ?? "",
    authority: enhanced?.authority ?? "",
    age: String(enhanced?.age ?? ""),
    country:
      enhanced?.country ?? enhanced?.country_code ?? "",
  };
}

/**
 * Format date string to human-readable format
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format gender code to human-readable format
 */
export function formatGender(g: string): string {
  if (g === "M" || g?.toLowerCase() === "male") return "Male";
  if (g === "F" || g?.toLowerCase() === "female") return "Female";
  return g || "—";
}

// Legacy exports for backwards compatibility
export type ShuftiExtractedName = {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
};

export type ShuftiExtractedAddress = {
  full_address?: string;
  street_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
};

export type ShuftiExtractedDocument = {
  name?: ShuftiExtractedName;
  dob?: string;
  gender?: string;
  nationality?: string;
  document_number?: string;
  mrz?: string;
  issue_date?: string;
  expiry_date?: string;
  country?: string;
  address?: ShuftiExtractedAddress;
  [key: string]: unknown;
};

export type ParsedExtractedData = {
  fullName: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  nationality: string | null;
  documentNumber: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  country: string | null;
  address: ShuftiExtractedAddress | null;
  rawData: ShuftiExtractedDocument;
};

/**
 * Parse extracted data (legacy — for backwards compatibility)
 */
export function parseExtractedData(data: unknown): ParsedExtractedData {
  const rawData = (data as ShuftiExtractedDocument) || {};
  
  const name = rawData.name as ShuftiExtractedName | undefined;
  const fullName = buildFullName(name);
  
  return {
    fullName,
    firstName: name?.first_name || null,
    middleName: name?.middle_name || null,
    lastName: name?.last_name || null,
    dateOfBirth: rawData.dob || null,
    gender: rawData.gender || null,
    nationality: rawData.nationality || null,
    documentNumber: rawData.document_number || null,
    issueDate: rawData.issue_date || null,
    expiryDate: rawData.expiry_date || null,
    country: rawData.country || null,
    address: rawData.address || null,
    rawData,
  };
}


/**
 * Build full name from name components
 */
function buildFullName(name?: ShuftiExtractedName): string | null {
  if (!name) return null;
  
  const parts = [name.first_name, name.middle_name, name.last_name]
    .filter(Boolean);
  
  return parts.length > 0 ? parts.join(" ") : null;
}

/**
 * Format date string from Shufti (YYYY-MM-DD or similar)
 */
export function formatShuftiDate(dateString?: string | null): string | null {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Get display format for extracted data field
 */
export function formatExtractedField(value: unknown, field: string): string {
  if (value === null || value === undefined) {
    return "—";
  }
  
  if (field === "dob" || field === "issue_date" || field === "expiry_date") {
    return formatShuftiDate(value as string) || "—";
  }
  
  if (typeof value === "string") {
    return value || "—";
  }
  
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if ("full_address" in obj) {
      return (obj.full_address as string) || "—";
    }
    return JSON.stringify(value);
  }
  
  return String(value) || "—";
}

/**
 * Get human-readable field labels for extracted data
 */
export function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    first_name: "First Name",
    middle_name: "Middle Name",
    last_name: "Last Name",
    dob: "Date of Birth",
    gender: "Gender",
    nationality: "Nationality",
    document_number: "Document Number",
    mrz: "Machine Readable Zone",
    issue_date: "Issue Date",
    expiry_date: "Expiry Date",
    country: "Country",
    full_address: "Address",
    street_address: "Street Address",
    city: "City",
    state: "State/Province",
    postal_code: "Postal Code",
  };
  
  return labels[field] || field.replace(/_/g, " ");
}

