/**
 * Shufti Pro Official Decline Codes
 * Source: GET https://api.shuftipro.com/decline/reasons/
 * 
 * Complete dictionary of decline codes with user-friendly remediation steps
 * Cached at startup and refreshed as needed
 */

export type ShuftiDeclineCode = {
  code: string;
  title: string;
  description: string;
  service: "document" | "face" | "address" | "general";
  userAction: string;
};

export type DeclineInfo = {
  code: string;
  title: string;
  description: string;
  service: string;
  userAction: string;
};

export type DeclineBreakdown = {
  primary: DeclineInfo | null;
  byService: {
    document: DeclineInfo[];
    face: DeclineInfo[];
    address: DeclineInfo[];
    general: DeclineInfo[];
  };
  allCodes: string[];
  humanReason: string;
};


/**
 * Complete official dictionary from Shufti API
 * Plus user-friendly actions for each code
 */
export const SHUFTI_DECLINE_DICTIONARY: Record<string, ShuftiDeclineCode> = {
  // ── Document Issues (SPDR codes) ─────────────────────────────
  SPDR01: {
    code: "SPDR01",
    title: "Face Not Matched",
    description: "The face on the document does not match the selfie",
    service: "face",
    userAction:
      "Ensure your selfie matches the photo on your document. Take the selfie in good lighting looking directly at the camera.",
  },
  SPDR02: {
    code: "SPDR02",
    title: "Document Expired",
    description: "The submitted document has expired",
    service: "document",
    userAction:
      "Use a valid document that has not expired. Check the expiry date before submitting.",
  },
  SPDR03: {
    code: "SPDR03",
    title: "Poor Quality Image",
    description:
      "The document image quality is insufficient for verification",
    service: "document",
    userAction:
      "Retake the photo in bright lighting. Ensure the document is flat, fully visible, and the camera is held steady.",
  },
  SPDR04: {
    code: "SPDR04",
    title: "Document Not Supported",
    description: "The submitted document type is not supported",
    service: "document",
    userAction:
      "Use a valid passport, national ID card, or driver's license.",
  },
  SPDR05: {
    code: "SPDR05",
    title: "Document Cropped or Incomplete",
    description:
      "The document image is cropped or parts are missing",
    service: "document",
    userAction:
      "Capture the full document. All four corners must be clearly visible in the frame.",
  },
  SPDR06: {
    code: "SPDR06",
    title: "Document Originality Failed",
    description:
      "The document could not be verified as an original physical document",
    service: "document",
    userAction:
      "Use your original physical document. Do NOT photograph a screen, scan, or photocopy. Place the document on a plain dark surface and photograph it directly.",
  },
  SPDR07: {
    code: "SPDR07",
    title: "Name Mismatch",
    description:
      "The name on the document does not match the provided information",
    service: "document",
    userAction:
      "Ensure you are using your own document. The name on the document must match exactly.",
  },
  SPDR08: {
    code: "SPDR08",
    title: "Date of Birth Mismatch",
    description: "The date of birth on the document does not match",
    service: "document",
    userAction:
      "Verify the date of birth is clearly visible on your document and try again.",
  },
  SPDR09: {
    code: "SPDR09",
    title: "Document Number Mismatch",
    description: "The document number could not be verified",
    service: "document",
    userAction:
      "Ensure the document number is fully visible and not obscured by glare or shadow.",
  },
  SPDR10: {
    code: "SPDR10",
    title: "Glare Detected",
    description:
      "Glare on the document is obscuring important information",
    service: "document",
    userAction:
      "Tilt the document slightly to eliminate glare. Use diffused lighting rather than direct light.",
  },
  SPDR11: {
    code: "SPDR11",
    title: "Document Not Readable",
    description: "Text on the document cannot be read",
    service: "document",
    userAction:
      "Clean your camera lens. Ensure the document is in sharp focus and all text is clearly readable.",
  },
  SPDR12: {
    code: "SPDR12",
    title: "Document Tampered",
    description:
      "The document appears to have been altered or tampered with",
    service: "document",
    userAction:
      "Only use genuine, unmodified government-issued documents.",
  },
  SPDR13: {
    code: "SPDR13",
    title: "Fake Document Detected",
    description: "The document has been identified as fraudulent",
    service: "document",
    userAction: "Only genuine government-issued documents are accepted.",
  },
  SPDR14: {
    code: "SPDR14",
    title: "Document Background Invalid",
    description:
      "The document background does not meet requirements",
    service: "document",
    userAction:
      "Place the document on a plain, dark, non-reflective surface before photographing.",
  },
  SPDR15: {
    code: "SPDR15",
    title: "Multiple Documents Detected",
    description: "More than one document was detected in the image",
    service: "document",
    userAction:
      "Only place one document at a time in the frame.",
  },
  SPDR16: {
    code: "SPDR16",
    title: "Document Too Far",
    description: "The document is too far from the camera",
    service: "document",
    userAction:
      "Move the camera closer to the document so it fills most of the frame.",
  },
  SPDR17: {
    code: "SPDR17",
    title: "Document Too Close",
    description: "The document is too close to the camera",
    service: "document",
    userAction:
      "Move the camera further from the document so all four corners are visible.",
  },
  SPDR18: {
    code: "SPDR18",
    title: "Blurry Image",
    description: "The document image is out of focus",
    service: "document",
    userAction:
      "Hold the camera steady and wait for it to focus before capturing. Tap the screen to focus on the document.",
  },
  SPDR19: {
    code: "SPDR19",
    title: "Dark Image",
    description: "The document image is too dark",
    service: "document",
    userAction:
      "Increase the lighting in your environment. Use a lamp or move to a well-lit area.",
  },
  SPDR20: {
    code: "SPDR20",
    title: "Overexposed Image",
    description:
      "The document image is too bright or overexposed",
    service: "document",
    userAction:
      "Reduce direct lighting on the document. Avoid photographing under direct overhead lights.",
  },
  SPDR21: {
    code: "SPDR21",
    title: "Face Not Detected on Document",
    description:
      "No face photo was found on the submitted document",
    service: "document",
    userAction:
      "Upload the side of the document that contains your photo (usually the front side).",
  },
  SPDR22: {
    code: "SPDR22",
    title: "Address Not Verified",
    description: "The address on the document could not be verified",
    service: "address",
    userAction:
      "Ensure your proof of address document is recent (within 3 months) and clearly shows your full address.",
  },
  SPDR23: {
    code: "SPDR23",
    title: "Document Type Not Matching",
    description:
      "The uploaded document does not match the selected document type",
    service: "document",
    userAction:
      "Select the correct document type before uploading. If you uploaded a passport, select 'Passport'. If you uploaded an ID card, select 'National ID Card'.",
  },
  SPDR24: {
    code: "SPDR24",
    title: "Gender Mismatch",
    description: "The gender on the document does not match",
    service: "document",
    userAction: "Ensure you are using your own document.",
  },
  SPDR25: {
    code: "SPDR25",
    title: "Issue Date Mismatch",
    description:
      "The issue date on the document could not be verified",
    service: "document",
    userAction:
      "Ensure the issue date on your document is clearly visible.",
  },
  SPDR26: {
    code: "SPDR26",
    title: "Expiry Date Mismatch",
    description:
      "The expiry date on the document could not be matched",
    service: "document",
    userAction:
      "Ensure the expiry date on your document is fully visible and not obscured.",
  },
  // ── Face/Liveness Issues ─────────────────────────────────────
  SPFR01: {
    code: "SPFR01",
    title: "Face Not Detected",
    description: "No face was detected in the selfie",
    service: "face",
    userAction:
      "Look directly at the camera. Ensure your full face including chin and forehead is visible in the frame.",
  },
  SPFR02: {
    code: "SPFR02",
    title: "Multiple Faces Detected",
    description: "More than one face was detected in the selfie",
    service: "face",
    userAction:
      "Take the selfie alone. Ensure no other people are in the background or frame.",
  },
  SPFR03: {
    code: "SPFR03",
    title: "Face Covered or Obscured",
    description: "Your face is partially covered or obscured",
    service: "face",
    userAction:
      "Remove sunglasses, hats, masks, scarves, or anything covering your face before taking the selfie.",
  },
  SPFR04: {
    code: "SPFR04",
    title: "Poor Selfie Quality",
    description: "The selfie image quality is insufficient",
    service: "face",
    userAction:
      "Take the selfie in bright, even lighting. Hold the camera at arm's length and keep it steady.",
  },
  SPFR05: {
    code: "SPFR05",
    title: "Liveness Check Failed",
    description:
      "The selfie could not be verified as a live person",
    service: "face",
    userAction:
      "Take a fresh selfie directly from your camera. Do not upload a photo of a photo or use a filtered/edited image.",
  },
  // ── Cancellation / Timeout ───────────────────────────────────
  SPDR241: {
    code: "SPDR241",
    title: "Verification Cancelled",
    description:
      "The user cancelled the verification process",
    service: "general",
    userAction:
      "Complete the verification without cancelling. All steps must be finished for verification to succeed.",
  },
  SPDR242: {
    code: "SPDR242",
    title: "New Request Cancelled Previous",
    description:
      "A new verification request cancelled the previous one",
    service: "general",
    userAction:
      "Only start one verification at a time. Complete the current verification before starting a new one.",
  },
  SPDR245: {
    code: "SPDR245",
    title: "Verification Timed Out",
    description: "The verification session expired before completion",
    service: "general",
    userAction:
      "Complete the verification promptly. The session has a 60-minute time limit.",
  },
};


/**
 * Get comprehensive breakdown of decline codes
 * Separates by service (document, face, address, general)
 * and provides primary action item
 */
export function getDeclineBreakdown(
  declinedCodes: string[] | null | undefined,
  servicesDeclinedCodes?: {
    document?: string[];
    face?: string[];
    address?: string[];
  } | null,
  declinedReason?: string | null
): DeclineBreakdown {
  // Collect all unique codes
  const allCodes = [
    ...(declinedCodes ?? []),
    ...(servicesDeclinedCodes?.document ?? []),
    ...(servicesDeclinedCodes?.face ?? []),
    ...(servicesDeclinedCodes?.address ?? []),
  ].filter((c, i, arr) => arr.indexOf(c) === i); // unique

  const lookup = (code: string): DeclineInfo => {
    const found = SHUFTI_DECLINE_DICTIONARY[code];
    if (found) return found;
    // Fallback for unknown codes
    return {
      code,
      title: "Verification Failed",
      description:
        declinedReason ?? "Verification could not be completed",
      service: "general",
      userAction:
        "Please try again with a clear, original document in good lighting.",
    };
  };

  // Organize by service
  const docInfos = (servicesDeclinedCodes?.document ?? [])
    .map(lookup)
    .filter((d): d is DeclineInfo => d !== null);
  const faceInfos = (servicesDeclinedCodes?.face ?? [])
    .map(lookup)
    .filter((d): d is DeclineInfo => d !== null);
  const addrInfos = (servicesDeclinedCodes?.address ?? [])
    .map(lookup)
    .filter((d): d is DeclineInfo => d !== null);
  const genInfos = (declinedCodes ?? [])
    .filter(
      (c) =>
        !servicesDeclinedCodes?.document?.includes(c) &&
        !servicesDeclinedCodes?.face?.includes(c) &&
        !servicesDeclinedCodes?.address?.includes(c)
    )
    .map(lookup)
    .filter((d): d is DeclineInfo => d !== null);

  // Primary action = first code, prioritize face > document > general
  const primary = faceInfos[0] ?? docInfos[0] ?? addrInfos[0] ?? genInfos[0] ?? null;

  return {
    primary,
    byService: {
      document: docInfos,
      face: faceInfos,
      address: addrInfos,
      general: genInfos,
    },
    allCodes,
    humanReason:
      declinedReason ?? primary?.description ?? "Verification unsuccessful",
  };
}

/**
 * Fetch live decline codes from Shufti API
 * Supplements our dictionary with any new codes
 * Non-blocking — if it fails, we use our pre-built dictionary
 */
export async function fetchShuftiDeclineCodes(): Promise<void> {
  try {
    const clientId = process.env.SHUFTI_CLIENT_ID;
    const secretKey = process.env.SHUFTI_SECRET_KEY;
    if (!clientId || !secretKey) return;

    const b64 = Buffer.from(`${clientId}:${secretKey}`).toString(
      "base64"
    );
    const res = await fetch(
      "https://api.shuftipro.com/decline/reasons/",
      {
        headers: {
          Authorization: `Basic ${b64}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) return;
    const data = (await res.json()) as {
      decline_reasons?: {
        status_code: string;
        description: string;
      }[];
    };

    // Supplement dictionary with any new codes
    for (const item of data.decline_reasons ?? []) {
      if (!SHUFTI_DECLINE_DICTIONARY[item.status_code]) {
        SHUFTI_DECLINE_DICTIONARY[item.status_code] = {
          code: item.status_code,
          title: item.description,
          description: item.description,
          service: "general",
          userAction:
            "Please try again following the on-screen guidance.",
        };
      }
    }
  } catch {
    // Non-blocking — dictionary already has common codes
  }
}

/**
 * Get remediation summary for a list of decline codes
 * Returns human-readable summary, steps to fix, and primary issue
 */
export function getRemediationSummary(
  declinedCodes: string[]
): {
  summary: string;
  steps: string[];
  primaryIssue: string;
} {
  const codes = declinedCodes.map((c) => SHUFTI_DECLINE_DICTIONARY[c]).filter(Boolean);

  if (codes.length === 0) {
    return {
      summary: "Your verification could not be completed.",
      steps: ["Please try again or contact support for assistance."],
      primaryIssue: "Verification failed",
    };
  }

  // Get primary (first) issue
  const primary = codes[0];
  const primaryIssue = primary.title || "Verification issue";

  // Build summary
  const summary = codes
    .map((c) => c.description)
    .join(" ")
    .substring(0, 200);

  // Build action steps
  const steps: string[] = [];
  const seenActions = new Set<string>();
  for (const code of codes) {
    if (code.userAction && !seenActions.has(code.userAction)) {
      steps.push(code.userAction);
      seenActions.add(code.userAction);
    }
  }

  if (steps.length === 0) {
    steps.push("Please re-submit your verification information and try again.");
  }

  return {
    summary,
    steps,
    primaryIssue,
  };
}
