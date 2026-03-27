import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getKYCRecord, refreshKYCFromShufti } from "@/actions/kyc";
import { KYCStatusBadge } from "@/modules/kyc/kyc-status-badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RefreshCw, User, FileText, ExternalLink, ClipboardCheck, Scan, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { parseExtractedData, groupExtractedData, isDocumentExpired } from "@/lib/shufti-extract";
import { getDeclineMessage } from "@/lib/shufti-decline-codes";

interface KYCDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function KYCDetailPage({ params }: KYCDetailPageProps) {
  const { id } = await params;
  const result = await getKYCRecord(id);

  if (!result.success || !result.data) notFound();

  const record = result.data;
  const parsed = parseExtractedData(record.extractedData);
  const groups = groupExtractedData(parsed);
  const isExpired = isDocumentExpired(parsed.expiryDate);
  
  // Get decline message if declined
  const declineInfo = record.status === "declined" 
    ? getDeclineMessage(record.declinedCodes as string[] | null | undefined)
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

        {/* Decline Reason Banner */}
        {record.status === "declined" && declineInfo && (
          <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100">
                    {declineInfo.title}
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                    {declineInfo.message}
                  </p>
                </div>
                {declineInfo.userAction && (
                  <div className="bg-white dark:bg-red-950/30 rounded-lg p-3 border border-red-100 dark:border-red-800">
                    <p className="text-xs font-semibold text-red-900 dark:text-red-200 mb-2">💡 How to fix this:</p>
                    <p className="text-sm text-red-800 dark:text-red-300">{declineInfo.userAction}</p>
                  </div>
                )}
                {record.declineReason && (
                  <div className="text-xs text-red-700 dark:text-red-300 pt-2 border-t border-red-200 dark:border-red-800">
                    <strong>Additional reason:</strong> {record.declineReason}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Scan className="h-4 w-4 text-slate-400" /> Extracted Identity Data
              </h2>
              
              {isExpired && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-2">
                  <span className="text-sm text-amber-800 dark:text-amber-200">
                    ⚠️ Document has expired or is expiring soon.
                  </span>
                </div>
              )}

              {groups.length > 0 ? (
                <div className="space-y-6">
                  {groups.map((group) => (
                    <div key={group.section} className="space-y-2">
                      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {group.section}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {group.fields.map((field) => (
                          <div key={field.label} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                            <p className="text-xs text-slate-500 dark:text-slate-400">{field.label}</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{field.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <Scan className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {record.status === "processing" || record.status === "pending"
                      ? "Extraction in progress - data will appear here once verification is complete"
                      : "No extracted data available"}
                  </p>
                </div>
              )}
            </div>

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
