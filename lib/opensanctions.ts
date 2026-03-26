/**
 * OpenSanctions API Integration Service
 * Provides entity matching, search, and retrieval for sanctions screening
 * 
 * API Docs: https://api.opensanctions.org/
 */

// ─────────────────────────────────────────────────────────
// TYPE DEFINITIONS
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
// CORE FUNCTIONS
// ─────────────────────────────────────────────────────────

/**
 * Match entities against the OpenSanctions default dataset
 * Supports batch matching (max 50 entities per request)
 * 
 * @param queries - Object mapping query ID to entity data
 * @returns Matches keyed by query ID
 * 
 * @example
 * const result = await matchEntities({
 *   "user_001": {
 *     schema: "Person",
 *     properties: {
 *       firstName: ["John"],
 *       lastName: ["Doe"],
 *       birthDate: ["1980-01-01"],
 *       nationality: ["Kenya"]
 *     }
 *   }
 * });
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
 * 
 * @example
 * const results = await searchEntities("Vladimir Putin", "Person");
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
 * 
 * @example
 * const entity = await getEntity("us-58db9b5f3");
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
 * 
 * @example
 * const results = await batchMatchEntities([
 *   { id: "user_1", data: { schema: "Person", properties: { ... } } },
 *   { id: "user_2", data: { schema: "Person", properties: { ... } } }
 * ]);
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
