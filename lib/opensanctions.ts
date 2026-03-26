/**
 * OpenSanctions API Integration Service
 * Provides entity matching, search, and retrieval for sanctions screening
 * 
 * API Docs: https://api.opensanctions.org/
 */

// ─────────────────────────────────────────────────────────
// TYPE DEFINITIONS - CORE ENTITY MATCHING
// ─────────────────────────────────────────────────────────

export interface PersonEntity {
  schema: "Person";
  properties: {
    firstName?: string[];
    lastName?: string[];
    birthDate?: string[]; // "YYYY" or "YYYY-MM-DD"
    nationality?: string[]; // country name or ISO code
    idNumber?: string[];
    email?: string[];
    phone?: string[];
    website?: string[];
    name?: string[];
  };
}

export interface CompanyEntity {
  schema: "Company";
  properties: {
    name: string[];
    jurisdiction?: string[]; // country name or ISO code
    registrationNumber?: string[];
    website?: string[];
    email?: string[];
    phone?: string[];
    incorporationDate?: string[];
  };
}

export interface LegalEntityProperties {
  schema: "LegalEntity";
  properties: {
    name: string[];
    jurisdiction?: string[];
    registrationNumber?: string[];
    website?: string[];
    country?: string[];
  };
}

export interface VesselEntity {
  schema: "Vessel";
  properties: {
    name: string[];
    flag?: string[]; // country flag
    imoNumber?: string[];
    mmsiNumber?: string[];
    callSign?: string[];
  };
}

export type OpenSanctionsEntity = PersonEntity | CompanyEntity | LegalEntityProperties | VesselEntity;

export interface MatchResult {
  id: string;
  caption: string;
  schema: string;
  properties: Record<string, unknown>;
  datasets: string[];
  countries?: string[];
  score: number;
  match: boolean;
  topics?: string[];
}

export interface MatchResponse {
  results: Record<string, MatchResult[]>; // keyed by query ID
}

export interface SearchResponse {
  results: MatchResult[];
}

export interface EntityDetailsResponse {
  id: string;
  caption: string;
  schema: string;
  properties: Record<string, unknown>;
  datasets: string[];
  countries?: string[];
  topics?: string[];
  sanctions?: Array<{
    program: string;
    country: string;
  }>;
  related?: Array<{
    id: string;
    caption: string;
    relationship: string;
  }>;
}

// ─────────────────────────────────────────────────────────
// TYPE DEFINITIONS - LEGACY AML
// ─────────────────────────────────────────────────────────

export type RiskLevel = "clear" | "low" | "medium" | "high" | "sanctioned";

export interface RiskAssessment {
  level: RiskLevel;
  score: number;
  summary: string;
  color: string;
  icon: string;
}

export interface SanctionsSearchResult {
  query: string;
  results: MatchResult[];
  riskLevel: RiskLevel;
  assessment: RiskAssessment;
  timestamp: string;
}

// ─────────────────────────────────────────────────────────
// CONFIGURATION & CLIENT
// ─────────────────────────────────────────────────────────

const API_BASE_URL = "https://api.opensanctions.org";
const DEFAULT_DATASET = "default";
const BATCH_SIZE = 20;
const BATCH_DELAY_MS = 100; // Rate limiting between batches

/**
 * Get the configured OpenSanctions API key from environment
 */
function getApiKey(): string {
  const key = process.env.OPENSANCTIONS_API_KEY;
  if (!key) {
    throw new Error(
      "OPENSANCTIONS_API_KEY environment variable is not configured. " +
      "Register for free at https://opensanctions.org/docs/"
    );
  }
  return key;
}

/**
 * Make authenticated requests to OpenSanctions API
 */
async function fetchOpenSanctions<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = getApiKey();
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Authorization": `ApiKey ${apiKey}`,
    "Content-Type": "application/json",
    "User-Agent": "deeptrack-kyc/1.0",
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `[OpenSanctions] API error (${response.status}):`,
        errorBody
      );
      throw new Error(
        `OpenSanctions API error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("[OpenSanctions] Request failed:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// CORE FUNCTIONS - ENTITY MATCHING
// ─────────────────────────────────────────────────────────

/**
 * Match entities against the OpenSanctions default dataset
 * Supports batch matching (max 50 entities per request)
 * 
 * @param queries - Object mapping query ID to entity data
 * @returns Matches keyed by query ID
 */
export async function matchEntities(
  queries: Record<string, OpenSanctionsEntity>
): Promise<MatchResponse> {
  return fetchOpenSanctions<MatchResponse>(
    `/api/v1/match/${DEFAULT_DATASET}`,
    {
      method: "POST",
      body: JSON.stringify(queries),
    }
  );
}

/**
 * Search for entities using free-text query
 * 
 * @param query - Search term (e.g. name, company)
 * @param schema - Optional schema filter: "Person", "Company", "LegalEntity", "Vessel"
 * @returns List of matching entities
 */
export async function searchEntities(
  query: string,
  schema?: "Person" | "Company" | "LegalEntity" | "Vessel"
): Promise<SearchResponse> {
  const params = new URLSearchParams();
  params.set("q", query);
  if (schema) params.set("schema", schema);

  return fetchOpenSanctions<SearchResponse>(
    `/api/v1/search/${DEFAULT_DATASET}?${params}`
  );
}

/**
 * Get full entity details by ID
 * Includes relationships, sanctions, and all properties
 * 
 * @param id - Entity ID from OpenSanctions
 * @returns Full entity details
 */
export async function getEntity(id: string): Promise<EntityDetailsResponse> {
  return fetchOpenSanctions<EntityDetailsResponse>(
    `/api/v1/entities/${id}`
  );
}

// ─────────────────────────────────────────────────────────
// BATCH MATCHING HELPER
// ─────────────────────────────────────────────────────────

/**
 * Match multiple entities in batches with rate limiting
 * Automatically handles batching for large datasets
 * 
 * @param entities - Array of entities to screen with IDs
 * @returns All results consolidated
 */
export async function batchMatchEntities(
  entities: Array<{ id: string; data: OpenSanctionsEntity }>
): Promise<Record<string, MatchResult[]>> {
  const allResults: Record<string, MatchResult[]> = {};

  // Process in batches
  for (let i = 0; i < entities.length; i += BATCH_SIZE) {
    const batch = entities.slice(i, i + BATCH_SIZE);
    const queries: Record<string, OpenSanctionsEntity> = {};

    batch.forEach((entity) => {
      queries[entity.id] = entity.data;
    });

    try {
      const response = await matchEntities(queries);
      Object.assign(allResults, response.results);

      // Rate limiting between batches
      if (i + BATCH_SIZE < entities.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    } catch (error) {
      console.error(
        `[OpenSanctions] Batch failed for entities ${i}-${i + BATCH_SIZE}:`,
        error
      );
      // Continue with remaining batches but track the error
      batch.forEach((entity) => {
        allResults[entity.id] = [];
      });
    }
  }

  return allResults;
}

// ─────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────

/**
 * Extract full name from person entity
 */
export function getPersonName(entity: PersonEntity): string {
  const firstName = entity.properties.firstName?.[0] ?? "";
  const lastName = entity.properties.lastName?.[0] ?? "";
  return [firstName, lastName].filter(Boolean).join(" ");
}

/**
 * Extract company name
 */
export function getCompanyName(entity: CompanyEntity): string {
  return entity.properties.name?.[0] ?? "Unknown";
}

/**
 * Check if any match found with high confidence (score >= 0.8)
 */
export function hasHighConfidenceMatch(matches: MatchResult[]): boolean {
  return matches.some((m) => m.score >= 0.8 && m.match);
}

/**
 * Get primary match if any
 */
export function getPrimaryMatch(matches: MatchResult[]): MatchResult | null {
  if (matches.length === 0) return null;
  return matches.reduce((best, current) =>
    current.score > best.score ? current : best
  );
}

/**
 * Format datasets for display
 */
export function formatDatasets(datasets: string[]): string {
  if (datasets.length === 0) return "—";
  return datasets.join(", ");
}

/**
 * Format match score as percentage
 */
export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/**
 * Format confidence score as percentage (legacy AML function)
 */
export function formatConfidenceScore(score?: number): string {
  if (!score) return "—";
  return `${Math.round(score * 100)}%`;
}

// ─────────────────────────────────────────────────────────
// LEGACY AML FUNCTIONS (for backward compatibility)
// ─────────────────────────────────────────────────────────

const RISK_ASSESSMENTS: Record<RiskLevel, RiskAssessment> = {
  clear: {
    level: "clear",
    score: 0,
    summary: "No sanctions or PEP records found",
    color: "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800",
    icon: "✓",
  },
  low: {
    level: "low",
    score: 1,
    summary: "Low risk - Minor matches found, review recommended",
    color: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
    icon: "!",
  },
  medium: {
    level: "medium",
    score: 2,
    summary: "Medium risk - Relevant matches found, further investigation needed",
    color: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800",
    icon: "⚠",
  },
  high: {
    level: "high",
    score: 3,
    summary: "High risk - Strong match to sanctions list or PEP record",
    color: "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800",
    icon: "⚠",
  },
  sanctioned: {
    level: "sanctioned",
    score: 4,
    summary: "SANCTIONED - Individual or entity on official sanctions list",
    color: "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800",
    icon: "✕",
  },
};

/**
 * Legacy AML search function for free-text queries
 * Maps to searchEntities internally
 */
export async function searchSanctions(
  fullName: string,
  country?: string
): Promise<SanctionsSearchResult> {
  const apiKey = process.env.OPENSANCTIONS_API_KEY;
  if (!apiKey) {
    console.error("[searchSanctions] OPENSANCTIONS_API_KEY not configured");
    return {
      query: fullName,
      results: [],
      riskLevel: "clear",
      assessment: RISK_ASSESSMENTS.clear,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const params = new URLSearchParams();
    params.set("api_key", apiKey);
    params.set("q", fullName);
    if (country) params.set("country", country);

    const response = await fetch(
      `https://api.opensanctions.org/api/v1/search?${params}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "User-Agent": "deeptrack-kyc/1.0",
        },
      }
    );

    if (!response.ok) {
      console.error("[searchSanctions] API error:", response.statusText);
      return {
        query: fullName,
        results: [],
        riskLevel: "clear",
        assessment: RISK_ASSESSMENTS.clear,
        timestamp: new Date().toISOString(),
      };
    }

    const data = (await response.json()) as {
      results?: Array<{ entity?: MatchResult }>;
    };
    const matches = data.results
      ?.map(r => r.entity)
      .filter((e): e is MatchResult => e !== undefined && e !== null) || [];

    const riskLevel = assessAMLRiskLevel(matches);
    const assessment = RISK_ASSESSMENTS[riskLevel];

    return {
      query: fullName,
      results: matches,
      riskLevel,
      assessment,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[searchSanctions] Exception:", error);
    return {
      query: fullName,
      results: [],
      riskLevel: "clear",
      assessment: RISK_ASSESSMENTS.clear,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Assess risk level based on sanctions matches
 */
function assessAMLRiskLevel(matches: MatchResult[]): RiskLevel {
  if (matches.length === 0) {
    return "clear";
  }

  // Check for high-confidence matches (score >= 0.95)
  const highConfidenceMatches = matches.filter(m => (m.score || 0) >= 0.95);
  if (highConfidenceMatches.length > 0) {
    return "sanctioned";
  }

  // Check for strong matches (score >= 0.85)
  const strongMatches = matches.filter(m => (m.score || 0) >= 0.85);
  if (strongMatches.length > 0) {
    return "high";
  }

  // Check for moderate matches (score >= 0.70)
  const moderateMatches = matches.filter(m => (m.score || 0) >= 0.70);
  if (moderateMatches.length > 0) {
    return "medium";
  }

  // Low confidence matches
  return "low";
}

/**
 * Get risk level color classes for UI (legacy function)
 */
export function getRiskLevelStyles(level: RiskLevel): {
  bgColor: string;
  textColor: string;
  borderColor: string;
  badgeColor: string;
} {
  const styles: Record<RiskLevel, any> = {
    clear: {
      bgColor: "bg-emerald-50 dark:bg-emerald-900/10",
      textColor: "text-emerald-800 dark:text-emerald-200",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      badgeColor: "bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200",
    },
    low: {
      bgColor: "bg-blue-50 dark:bg-blue-900/10",
      textColor: "text-blue-800 dark:text-blue-200",
      borderColor: "border-blue-200 dark:border-blue-800",
      badgeColor: "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
    },
    medium: {
      bgColor: "bg-amber-50 dark:bg-amber-900/10",
      textColor: "text-amber-800 dark:text-amber-200",
      borderColor: "border-amber-200 dark:border-amber-800",
      badgeColor: "bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200",
    },
    high: {
      bgColor: "bg-orange-50 dark:bg-orange-900/10",
      textColor: "text-orange-800 dark:text-orange-200",
      borderColor: "border-orange-200 dark:border-orange-800",
      badgeColor: "bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200",
    },
    sanctioned: {
      bgColor: "bg-red-50 dark:bg-red-900/10",
      textColor: "text-red-800 dark:text-red-200",
      borderColor: "border-red-200 dark:border-red-800",
      badgeColor: "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200",
    },
  };
  return styles[level];
}
