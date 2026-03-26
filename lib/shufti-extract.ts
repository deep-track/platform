/**
 * Shufti Pro Extracted Data Parsing and Display Utilities
 * 
 * Handles parsing and formatting of extracted document data from Shufti verification
 */

export interface ShuftiExtractedName {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
}

export interface ShuftiExtractedAddress {
  full_address?: string;
  street_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface ShuftiExtractedDocument {
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
}

export interface ParsedExtractedData {
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
}

/**
 * Parse extracted data from Shufti verification
 * Handles nested structure and null safety
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
 * Check if document is expired based on expiry date
 */
export function isDocumentExpired(expiryDate?: string | null): boolean {
  if (!expiryDate) return false;
  
  try {
    const expiry = new Date(expiryDate);
    return expiry < new Date();
  } catch {
    return false;
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

/**
 * Create display groups for extracted data fields
 */
export function groupExtractedData(parsed: ParsedExtractedData): {
  section: string;
  fields: Array<{ label: string; value: string }>;
}[] {
  const groups: {
    section: string;
    fields: Array<{ label: string; value: string }>;
  }[] = [];
  
  // Personal Info Group
  const personalFields = [
    { label: "Full Name", value: parsed.fullName },
    { label: "Date of Birth", value: formatShuftiDate(parsed.dateOfBirth) },
    { label: "Gender", value: parsed.gender },
    { label: "Nationality", value: parsed.nationality },
  ].filter(({ value }) => value !== null);
  
  if (personalFields.length > 0) {
    groups.push({
      section: "Personal Information",
      fields: personalFields.map(({ label, value }) => ({
        label,
        value: value || "—",
      })),
    });
  }
  
  // Document Info Group
  const documentFields = [
    { label: "Document Number", value: parsed.documentNumber },
    { label: "Country", value: parsed.country },
    { label: "Issue Date", value: formatShuftiDate(parsed.issueDate) },
    { label: "Expiry Date", value: formatShuftiDate(parsed.expiryDate) },
  ].filter(({ value }) => value !== null);
  
  if (documentFields.length > 0) {
    groups.push({
      section: "Document Information",
      fields: documentFields.map(({ label, value }) => ({
        label,
        value: value || "—",
      })),
    });
  }
  
  // Address Group
  if (parsed.address) {
    const addressFields = [
      { label: "Full Address", value: parsed.address.full_address },
      { label: "Street", value: parsed.address.street_address },
      { label: "City", value: parsed.address.city },
      { label: "State", value: parsed.address.state },
      { label: "Postal Code", value: parsed.address.postal_code },
      { label: "Country", value: parsed.address.country },
    ].filter(({ value }) => value !== null && value !== undefined);
    
    if (addressFields.length > 0) {
      groups.push({
        section: "Address",
        fields: addressFields.map(({ label, value }) => ({
          label,
          value: value || "—",
        })),
      });
    }
  }
  
  return groups;
}
