import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getKYCRecord, refreshKYCFromShufti } from "@/actions/kyc";
import { KYCStatusBadge } from "@/modules/kyc/kyc-status-badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RefreshCw, User, FileText, ExternalLink, ClipboardCheck, Scan, AlertTriangle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { parseShuftiExtracted, formatDate, formatGender } from "@/lib/shufti-extract";
import { getDeclineBreakdown, fetchShuftiDeclineCodes } from "@/lib/shufti-decline-codes";

interface KYCDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function KYCDetailPage({ params }: KYCDetailPageProps) {
  const { id } = await params;
  const result = await getKYCRecord(id);

  if (!result.success || !result.data) notFound();

  // Prefetch decline codes if needed
  if (!(globalThis as any)._shuftiCodesLoaded) {
    await fetchShuftiDeclineCodes().catch(() => {
      // Silent fail - we have a built-in dictionary
    });
    (globalThis as any)._shuftiCodesLoaded = true;
  }

  const record = result.data;
  
  // Parse extracted data from BOTH sources
  const extracted = parseShuftiExtracted(
    record.extractedData,
    (record as any).additionalData  // additionalData is a new field
  );

  // Get decline breakdown if declined
  const declineInfo = record.status === "declined"
    ? getDeclineBreakdown(
        record.declinedCodes as string[] | null,
        (record as any).servicesDeclinedCodes as {
          document?: string[];
          face?: string[];
          address?: string[];
        } | null,
        record.declineReason
      )
    : null;

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/kyc" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to KYC
          </Link>
          <div className="flex items-center gap-3">
            <form action={async () => {"use server"; await refreshKYCFromShufti(record.id, record.reference);}}>
              <Button variant="outline" size="sm" type="submit">
                <RefreshCw className="mr-2 h-3.5 w-3.5" /> Refresh
              </Button>
            </form>
            {(record.status === "processing" || record.status === "requires_review") && (
              <Button asChild size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
                <Link href={`/kyc/${id}/review`}>
                  <ClipboardCheck className="mr-2 h-4 w-4" /> Review
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <User className="h-7 w-7 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{record.userName}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{record.userEmail}</p>
                <div className="mt-2"><KYCStatusBadge status={record.status} /></div>
              </div>
            </div>
            <code className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{record.reference}</code>
          </div>
        </div>

        {/* Decline Feedback — shown when declined */}
        {record.status === "declined" && declineInfo && (
          <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h2 className="text-sm font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider">
                Decline Reason
              </h2>
            </div>

            {/* Human-readable reason from Shufti */}
            <p className="text-sm text-red-600 dark:text-red-500 mb-4">
              {declineInfo.humanReason}
            </p>

            {/* Primary action */}
            {declineInfo.primary && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4 mb-4">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                  💡 How to fix: {declineInfo.primary.title}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {declineInfo.primary.userAction}
                </p>
              </div>
            )}

            {/* Per-service breakdown */}
            {(declineInfo.byService.document.length > 0 ||
              declineInfo.byService.face.length > 0) && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">
                  Issues by service:
                </p>
                {declineInfo.byService.document.map((d) => (
                  <div key={d.code} className="flex items-start gap-2">
                    <span className="text-xs font-mono text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded flex-shrink-0">
                      {d.code}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-red-700 dark:text-red-400">
                        Document: {d.title}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-500">
                        {d.userAction}
                      </p>
                    </div>
                  </div>
                ))}
                {declineInfo.byService.face.map((d) => (
                  <div key={d.code} className="flex items-start gap-2">
                    <span className="text-xs font-mono text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded flex-shrink-0">
                      {d.code}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-red-700 dark:text-red-400">
                        Selfie: {d.title}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-500">
                        {d.userAction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Extracted Data Card */}
            {(extracted.fullName || extracted.dob || extracted.documentNumber) ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-7 w-7 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Scan className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Extracted from Document
                  </h2>
                  <span className="ml-auto text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                    Auto-verified by OCR
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  {extracted.fullName && (
                    <div>
                      <p className="text-xs text-slate-400">Full Name</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                        {extracted.fullName}
                      </p>
                    </div>
                  )}
                  {extracted.dob && (
                    <div>
                      <p className="text-xs text-slate-400">Date of Birth</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                        {formatDate(extracted.dob)}
                      </p>
                    </div>
                  )}
                  {extracted.gender && (
                    <div>
                      <p className="text-xs text-slate-400">Gender</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                        {formatGender(extracted.gender)}
                      </p>
                    </div>
                  )}
                  {extracted.nationality && (
                    <div>
                      <p className="text-xs text-slate-400">Nationality</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                        {extracted.nationality}
                      </p>
                    </div>
                  )}
                  {extracted.documentNumber && (
                    <div>
                      <p className="text-xs text-slate-400">Document Number</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5 font-mono">
                        {extracted.documentNumber}
                      </p>
                    </div>
                  )}
                  {extracted.expiryDate && (
                    <div>
                      <p className="text-xs text-slate-400">Expiry Date</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                        {formatDate(extracted.expiryDate)}
                      </p>
                    </div>
                  )}
                  {extracted.issueDate && (
                    <div>
                      <p className="text-xs text-slate-400">Issue Date</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                        {formatDate(extracted.issueDate)}
                      </p>
                    </div>
                  )}
                  {extracted.documentType && (
                    <div>
                      <p className="text-xs text-slate-400">Document Type</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5 capitalize">
                        {extracted.documentType.replace(/_/g, " ")}
                      </p>
                    </div>
                  )}
                  {extracted.placeOfBirth && (
                    <div>
                      <p className="text-xs text-slate-400">Place of Birth</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                        {extracted.placeOfBirth}
                      </p>
                    </div>
                  )}
                  {extracted.authority && (
                    <div>
                      <p className="text-xs text-slate-400">Issuing Authority</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                        {extracted.authority}
                      </p>
                    </div>
                  )}
                  {extracted.country && (
                    <div>
                      <p className="text-xs text-slate-400">Country</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                        {extracted.country}
                      </p>
                    </div>
                  )}
                  {extracted.age && (
                    <div>
                      <p className="text-xs text-slate-400">Age</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                        {extracted.age} years
                      </p>
                    </div>
                  )}
                </div>

                {/* Verification check results */}
                {record.verificationResult && (
                  <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Verification Checks
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(
                        (record.verificationResult as Record<string, unknown>)
                          .document as Record<string, number | null> ?? {}
                      ).map(([key, value]) => {
                        if (value === null || value === undefined) return null;
                        const passed = value === 1;
                        const label = key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase());
                        return (
                          <span
                            key={key}
                            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium ${
                              passed
                                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                            }`}
                          >
                            {passed ? "✓" : "✗"} {label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Scan className="h-4 w-4 text-slate-400" />
                  <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Extracted Data
                  </h2>
                </div>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  {record.status === "processing" || record.status === "pending"
                    ? "Verification in progress — extracted data will appear here once processing is complete."
                    : "No data was extracted. This typically occurs when the document was rejected before OCR completed."}
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" /> Captured Documents
              </h2>
              <p className="text-sm mb-4">Document type: <strong>{record.documentType}</strong></p>
              <div className="flex gap-4 mt-4">
                {record.documentFrontUrl && (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Front</p>
                    <div className="h-28 w-44 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative bg-slate-100 dark:bg-slate-800">
                      <Image src={record.documentFrontUrl} alt="Document front" fill className="object-cover" />
                    </div>
                  </div>
                )}
                {record.documentBackUrl && (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Back</p>
                    <div className="h-28 w-44 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative bg-slate-100 dark:bg-slate-800">
                      <Image src={record.documentBackUrl} alt="Document back" fill className="object-cover" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {record.selfieUrl && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">Selfie</h2>
                <div className="h-48 w-36 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative mx-auto">
                  <Image src={record.selfieUrl} alt="Selfie" fill className="object-cover" />
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider">Verification Details</h2>
              
              {record.status === "approved" && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Verified</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Event:</span>
                  <span className="ml-2 font-medium text-slate-900 dark:text-white">{record.shuftiEventType ?? "—"}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Submitted:</span>
                  <span className="ml-2 font-medium text-slate-900 dark:text-white">
                    {record.submittedAt ? format(new Date(record.submittedAt), "MMM d, yyyy HH:mm") : "—"}
                  </span>
                </div>
                {record.reviewedAt && (
                  <div className="text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Reviewed:</span>
                    <span className="ml-2 font-medium text-slate-900 dark:text-white">
                      {format(new Date(record.reviewedAt), "MMM d, yyyy HH:mm")}
                    </span>
                  </div>
                )}
              </div>

              {record.shuftiVerificationUrl && (
                <a 
                  href={record.shuftiVerificationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 pt-2 border-t border-slate-200 dark:border-slate-700 mt-4"
                >
                  View Shufti Details <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
