/**
 * Shufti Pro Decline Code Mappings and Utilities
 * 
 * Maps Shufti decline codes to user-friendly messages and remediation steps
 */

export type ShuftiDeclineCode = 
  | "SPDR01" | "SPDR02" | "SPDR03" | "SPDR04" | "SPDR05" | "SPDR06" | "SPDR07" | "SPDR08" | "SPDR09" | "SPDR10"
  | "SPFR01" | "SPFR02" | "SPFR03" | "SPFR04" | "SPFR05";

export interface DeclineMessage {
  code: string;
  reason: string;
  howToFix: string[];
  suggestion: string;
}

/**
 * Decline code registry with user-friendly messages and remediation steps
 */
const DECLINE_CODE_REGISTRY: Record<ShuftiDeclineCode, DeclineMessage> = {
  // Document-related declines (SPDR codes)
  SPDR01: {
    code: "SPDR01",
    reason: "Document not readable - Image quality too low or blurry",
    howToFix: [
      "Take a photo in good lighting conditions",
      "Ensure the entire document is visible and clear",
      "Use a steady hand or support your device",
      "Clean your camera lens",
      "Retake the photo and try again"
    ],
    suggestion: "Document Quality Issue"
  },
  SPDR02: {
    code: "SPDR02",
    reason: "Document expired - Your document has passed its expiration date",
    howToFix: [
      "Renew your document with the issuing authority",
      "Apply for a new document if yours has expired",
      "Check the expiry date before submitting",
      "Use a valid, non-expired document for verification"
    ],
    suggestion: "Document Expired"
  },
  SPDR03: {
    code: "SPDR03",
    reason: "Document not supported - This document type is not accepted",
    howToFix: [
      "Use one of the supported document types: Passport, National ID, or Driver's License",
      "Check that your document is in the accepted format",
      "Try uploading a different valid document"
    ],
    suggestion: "Invalid Document Type"
  },
  SPDR04: {
    code: "SPDR04",
    reason: "Document fake or forged - Document appears to be counterfeit",
    howToFix: [
      "Only submit original, genuine documents",
      "Contact support if you believe this is an error",
      "Ensure you're uploading authentic government-issued documents"
    ],
    suggestion: "Document Authenticity Issue"
  },
  SPDR05: {
    code: "SPDR05",
    reason: "Name mismatch - Name doesn't match across documents",
    howToFix: [
      "Ensure the name on all documents matches exactly",
      "Use your legal name as it appears on official documents",
      "Resubmit with documents that have consistent names"
    ],
    suggestion: "Name Inconsistency"
  },
  SPDR06: {
    code: "SPDR06",
    reason: "Document missing information - Required fields are blank or illegible",
    howToFix: [
      "Ensure all document fields are clearly visible and readable",
      "Submit a document with complete information",
      "Take a new photo ensuring all text is legible",
      "Use good lighting to capture all details"
    ],
    suggestion: "Incomplete Document"
  },
  SPDR07: {
    code: "SPDR07",
    reason: "Document partially obscured - Parts of the document are hidden or cut off",
    howToFix: [
      "Ensure the entire document is visible in the photo",
      "Retake the photo to include all document edges",
      "Remove any objects blocking the document",
      "Frame the document properly to capture all information"
    ],
    suggestion: "Document Not Fully Visible"
  },
  SPDR08: {
    code: "SPDR08",
    reason: "Wrong document side - You submitted the same side twice",
    howToFix: [
      "For documents with two sides, submit both front AND back",
      "Ensure you upload different sides (front vs back)",
      "Check that your back document upload is unique"
    ],
    suggestion: "Both Document Sides Required"
  },
  SPDR09: {
    code: "SPDR09",
    reason: "Document data invalid - Information on document appears invalid or suspicious",
    howToFix: [
      "Verify that all information on your document is correct",
      "Ensure your document hasn't been tampered with",
      "Contact the issuing authority if there are errors",
      "Submit a fresh document without any alterations"
    ],
    suggestion: "Document Data Issue"
  },
  SPDR10: {
    code: "SPDR10",
    reason: "Document not original - A photocopy or digital copy was submitted",
    howToFix: [
      "Submit a photo of the original document, not a copy",
      "Take a fresh photo of your physical document",
      "Ensure good lighting and clarity in your submission",
      "Avoid using photocopied or scanned versions"
    ],
    suggestion: "Original Document Required"
  },

  // Face-related declines (SPFR codes)
  SPFR01: {
    code: "SPFR01",
    reason: "Face not readable - Selfie quality is too low or blurry",
    howToFix: [
      "Take a selfie in good lighting (natural light is best)",
      "Ensure your entire face is clearly visible",
      "Remove any sunglasses or hats that obscure your face",
      "Keep your device steady while taking the photo",
      "Retake the selfie in a well-lit area"
    ],
    suggestion: "Selfie Quality Issue"
  },
  SPFR02: {
    code: "SPFR02",
    reason: "Face not clearly visible - Selfie is obscured or partially hidden",
    howToFix: [
      "Ensure your entire face is visible and not cropped",
      "Remove any objects blocking your face",
      "Face the camera directly",
      "Retake the selfie ensuring full face visibility"
    ],
    suggestion: "Face Not Fully Visible"
  },
  SPFR03: {
    code: "SPFR03",
    reason: "Multiple faces detected - Only one face should be in the image",
    howToFix: [
      "Take a selfie with only yourself in the frame",
      "Ensure no other people are visible in the background",
      "Move to a location where you can take a solo selfie",
      "Retake the photo with just your face visible"
    ],
    suggestion: "Only Your Face Should Be Visible"
  },
  SPFR04: {
    code: "SPFR04",
    reason: "Face doesn't match document - Your selfie doesn't match the document photo",
    howToFix: [
      "Take a fresh, clear selfie of yourself",
      "Ensure good lighting and clear visibility of your face",
      "Remove glasses, makeup, or accessories if they significantly change your appearance",
      "Ensure your facial expression is natural",
      "Retake the selfie ensuring you look like your document photo"
    ],
    suggestion: "Selfie Doesn't Match Document"
  },
  SPFR05: {
    code: "SPFR05",
    reason: "Face expression issues - Selfie has poor expression, angles, or lighting",
    howToFix: [
      "Maintain a natural, neutral facial expression",
      "Ensure your face is fully lit and visible",
      "Take the photo facing the camera directly",
      "Retake the selfie with proper lighting and positioning"
    ],
    suggestion: "Selfie Expression/Angle Issue"
  }
};

/**
 * Get decline message by code
 */
export function getDeclineMessage(code: string): DeclineMessage | null {
  if (code in DECLINE_CODE_REGISTRY) {
    return DECLINE_CODE_REGISTRY[code as ShuftiDeclineCode];
  }
  return null;
}

/**
 * Get all decline messages for multiple codes
 */
export function getDeclineMessages(codes: string[]): DeclineMessage[] {
  return codes
    .map(code => getDeclineMessage(code))
    .filter((msg): msg is DeclineMessage => msg !== null);
}

/**
 * Format decline codes for display
 */
export function formatDeclineCodesList(codes: string[]): string {
  return codes.join(", ");
}

/**
 * Get remediation summary from multiple decline codes
 */
export function getRemediationSummary(codes: string[]): {
  summary: string;
  steps: string[];
  primaryIssue: string;
} {
  const messages = getDeclineMessages(codes);
  
  if (messages.length === 0) {
    return {
      summary: "Unknown decline reason",
      steps: ["Please contact support for assistance"],
      primaryIssue: "Unknown Issue"
    };
  }

  const primaryMessage = messages[0];
  const allSteps = [...new Set(messages.flatMap(m => m.howToFix))];

  return {
    summary: primaryMessage.reason,
    steps: allSteps.slice(0, 5), // Limit to top 5 steps
    primaryIssue: primaryMessage.suggestion
  };
}
