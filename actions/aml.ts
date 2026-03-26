"use server";

import type { SanctionsSearchResult } from "@/lib/opensanctions";

interface AMLSearchResult {
  success: boolean;
  data?: SanctionsSearchResult;
  error?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://deeptrack-platform.onrender.com";

export async function searchAML(
  fullName: string,
  country?: string
): Promise<AMLSearchResult> {
  try {
    if (!fullName || fullName.trim().length === 0) {
      return { success: false, error: "Full name is required" };
    }

    const appUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || APP_URL;
    const response = await fetch(`${appUrl}/api/aml/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, country }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[searchAML] API error:", text);
      return { success: false, error: "AML search failed" };
    }

    const result = await response.json() as AMLSearchResult;
    return result;
  } catch (err) {
    console.error("[searchAML]", err);
    return { success: false, error: "Failed to search AML records" };
  }
}
