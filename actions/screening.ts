"use server";

import type { OpenSanctionsEntity } from "@/lib/opensanctions";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://deeptrack-platform.onrender.com";

export interface ScreeningEntity {
  id: string;
  name: string;
  data: OpenSanctionsEntity;
}

export interface ScreeningResponse {
  entityId: string;
  name: string;
  matchFound: boolean;
  matchCount: number;
  primaryMatch?: {
    id: string;
    caption: string;
    score: number;
    datasets: string[];
  } | null;
  screeningId: string;
}

/**
 * Screen one or more entities against OpenSanctions
 * Automatically batches requests and stores results in database
 * 
 * @param entities - Array of entities to screen (id, name, data)
 * @returns Screening results with match information
 * 
 * @example
 * const results = await screenEntities([{
 *   id: "user_001",
 *   name: "John Smith",
 *   data: {
 *     schema: "Person",
 *     properties: {
 *       firstName: ["John"],
 *       lastName: ["Smith"],
 *       birthDate: ["1980-01-15"],
 *       nationality: ["Kenya"]
 *     }
 *   }
 * }]);
 * 
 * if (results[0].matchFound) {
 *   console.log(`Match found: ${results[0].primaryMatch?.caption}`);
 * }
 */
export async function screenEntities(
  entities: ScreeningEntity[]
): Promise<ScreeningResponse[]> {
  try {
    if (!entities || entities.length === 0) {
      return [];
    }

    const appUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || APP_URL;
    
    const response = await fetch(`${appUrl}/api/screening/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entities }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[screenEntities] API error:", error);
      throw new Error(`Screening API failed: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      success: boolean;
      results: ScreeningResponse[];
      error?: string;
    };

    if (!data.success) {
      throw new Error(data.error || "Screening failed");
    }

    return data.results;
  } catch (error) {
    console.error("[screenEntities]", error);
    throw error;
  }
}

/**
 * Screen a single person
 * 
 * @example
 * const result = await screenPerson({
 *   id: "user_123",
 *   firstName: "Vladimir",
 *   lastName: "Putin",
 *   birthDate: "1952-10-01",
 *   nationality: "Russia"
 * });
 */
export async function screenPerson(
  personData: {
    id: string;
    firstName: string;
    lastName: string;
    birthDate?: string;
    nationality?: string;
  }
): Promise<ScreeningResponse> {
  const results = await screenEntities([{
    id: personData.id,
    name: `${personData.firstName} ${personData.lastName}`,
    data: {
      schema: "Person",
      properties: {
        firstName: [personData.firstName],
        lastName: [personData.lastName],
        ...(personData.birthDate && { birthDate: [personData.birthDate] }),
        ...(personData.nationality && { nationality: [personData.nationality] }),
      },
    },
  }]);

  return results[0];
}

/**
 * Screen a single company
 * 
 * @example
 * const result = await screenCompany({
 *   id: "company_456",
 *   name: "Example Corp",
 *   jurisdiction: "Kenya"
 * });
 */
export async function screenCompany(
  companyData: {
    id: string;
    name: string;
    jurisdiction?: string;
    registrationNumber?: string;
  }
): Promise<ScreeningResponse> {
  const results = await screenEntities([{
    id: companyData.id,
    name: companyData.name,
    data: {
      schema: "Company",
      properties: {
        name: [companyData.name],
        ...(companyData.jurisdiction && { jurisdiction: [companyData.jurisdiction] }),
        ...(companyData.registrationNumber && { registrationNumber: [companyData.registrationNumber] }),
      },
    },
  }]);

  return results[0];
}
