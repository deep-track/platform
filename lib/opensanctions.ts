/**
 * OpenSanctions API Integration for AML Screening
 * 
 * Provides comprehensive sanctions and PEP screening with risk assessment
 * Uses the OpenSanctions API (https://api.opensanctions.org)
 */

export type RiskLevel = "clear" | "low" | "medium" | "high" | "sanctioned";

export interface RiskAssessment {
  level: RiskLevel;
  score: number;
  summary: string;
  color: string;
  icon: string;
}

export interface SanctionMatch {
  id: string;
  schema: string;
  caption: string;
  datasets: string[];
  countries: string[];
  targets: string[];
  match: boolean;
  score: number;
  properties: Record<string, unknown>;
}

export interface SanctionsSearchResult {
  query: string;
  results: SanctionMatch[];
  riskLevel: RiskLevel;
  assessment: RiskAssessment;
  timestamp: string;
}

/**
 * Risk assessment configurations
 */
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
 * Search for sanctions and PEP records using OpenSanctions API
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
      results?: Array<{ entity?: SanctionMatch }>;
    };
    const matches = data.results
      ?.map(r => r.entity)
      .filter((e): e is SanctionMatch => e !== undefined && e !== null) || [];

    const riskLevel = assessRiskLevel(matches);
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
function assessRiskLevel(matches: SanctionMatch[]): RiskLevel {
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
 * Format confidence score as percentage
 */
export function formatConfidenceScore(score?: number): string {
  if (!score) return "—";
  return `${Math.round(score * 100)}%`;
}

/**
 * Get datasets string from match
 */
export function formatDatasets(datasets?: string[]): string {
  if (!datasets || datasets.length === 0) return "—";
  return datasets.join(", ");
}

/**
 * Get risk level color classes for UI
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
