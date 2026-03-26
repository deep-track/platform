"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Shield, Search, ExternalLink, AlertCircle, CheckCircle } from "lucide-react";
import { searchAML } from "@/actions/aml";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRiskLevelStyles, formatConfidenceScore, formatDatasets, type RiskLevel } from "@/lib/opensanctions";

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "SG", name: "Singapore" },
  { code: "HK", name: "Hong Kong" },
  { code: "JP", name: "Japan" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "CH", name: "Switzerland" },
];

export default function AMLCheckPage() {
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);

  async function handleSearch() {
    if (!fullName.trim()) {
      toast.error("Please enter a full name");
      return;
    }

    setLoading(true);
    try {
      const result = await searchAML(fullName, country || undefined);
      if (result.success && result.data) {
        setSearchResult(result.data);
        toast.success("AML search completed");
      } else {
        toast.error(result.error || "Search failed");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("An error occurred during search");
    } finally {
      setLoading(false);
    }
  }

  const riskStyles = searchResult ? getRiskLevelStyles(searchResult.riskLevel) : null;

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Shield className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              AML Screening
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Check for sanctions, PEP records, and adverse media using OpenSanctions
          </p>
        </div>

        {/* Search Form */}
        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Search Individual or Entity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Full Name *
                </label>
                <Input
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Country (Optional)
                </label>
                <Select value={country} onValueChange={setCountry} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleSearch}
              disabled={loading || !fullName.trim()}
              className="bg-violet-600 hover:bg-violet-700 text-white w-full sm:w-auto"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </Card>

        {/* Results */}
        {searchResult && (
          <div className="space-y-6">
            {/* Risk Assessment Banner */}
            <div
              className={`rounded-2xl border-2 p-6 space-y-3 ${riskStyles?.borderColor} ${riskStyles?.bgColor}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    searchResult.riskLevel === "clear"
                      ? "bg-emerald-200 dark:bg-emerald-900/50 text-emerald-700"
                      : searchResult.riskLevel === "sanctioned"
                        ? "bg-red-200 dark:bg-red-900/50 text-red-700"
                        : "bg-amber-200 dark:bg-amber-900/50 text-amber-700"
                  }`}
                >
                  {searchResult.riskLevel === "clear" ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <AlertCircle className="h-6 w-6" />
                  )}
                </div>

                <div className="flex-1">
                  <h3
                    className={`font-bold text-lg ${
                      searchResult.riskLevel === "clear"
                        ? "text-emerald-900 dark:text-emerald-100"
                        : searchResult.riskLevel === "sanctioned"
                          ? "text-red-900 dark:text-red-100"
                          : "text-amber-900 dark:text-amber-100"
                    }`}
                  >
                    Risk Level:{" "}
                    <span className="uppercase">{searchResult.riskLevel}</span>
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      searchResult.riskLevel === "clear"
                        ? "text-emerald-800 dark:text-emerald-200"
                        : searchResult.riskLevel === "sanctioned"
                          ? "text-red-800 dark:text-red-200"
                          : "text-amber-800 dark:text-amber-200"
                    }`}
                  >
                    {searchResult.assessment.summary}
                  </p>
                </div>
              </div>

              {searchResult.results.length > 0 && (
                <p
                  className={`text-sm font-medium ${
                    searchResult.riskLevel === "clear"
                      ? "text-emerald-700 dark:text-emerald-300"
                      : searchResult.riskLevel === "sanctioned"
                        ? "text-red-700 dark:text-red-300"
                        : "text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {searchResult.results.length} match{searchResult.results.length !== 1 ? "es" : ""} found
                </p>
              )}
            </div>

            {/* Matched Records */}
            {searchResult.results.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Matched Records
                </h3>
                {searchResult.results.map((match: any) => (
                  <Card
                    key={match.id}
                    className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <a
                          href={`https://opensanctions.org/entities/${match.id}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-2"
                        >
                          {match.caption}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Schema: {match.schema}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">
                          Confidence
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {formatConfidenceScore(match.score)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">
                          Datasets
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {formatDatasets(match.datasets)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">
                          Countries
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {match.countries?.join(", ") || "—"}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* No Matches */}
            {searchResult.results.length === 0 && (
              <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10 p-6 text-center space-y-3">
                <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <div>
                  <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
                    All Clear
                  </h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                    No sanctions or PEP records found for {fullName}
                  </p>
                </div>
              </Card>
            )}

            {/* Last Updated */}
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Search completed at{" "}
              {new Date(searchResult.timestamp).toLocaleString()}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!searchResult && (
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-12 text-center">
            <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              No searches yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Enter a name above to begin AML screening
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
