import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { getKYIRecord, refreshKYIFromShufti } from "@/actions/kyi";
import { KYIStatusBadge } from "@/modules/kyi/kyi-status-badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  RefreshCw,
  Building2,
  ExternalLink,
  ClipboardCheck,
  FileCheck2,
} from "lucide-react";

interface KYIDetailPageProps {
  params: Promise<{ id: string }>;
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-xs text-slate-500 dark:text-slate-400 sm:w-44 flex-shrink-0">{label}</span>
      <span className="text-sm text-slate-800 dark:text-slate-200 font-medium break-words">{value}</span>
    </div>
  );
}

export default async function KYIDetailPage({ params }: KYIDetailPageProps) {
  const { id } = await params;
  const result = await getKYIRecord(id);

  if (!result.success || !result.data) notFound();

  const record = result.data;
  const institution = record.institutionInfo;
  const representative = record.representative;
  const documents = record.documents;

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/kyi"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to KYI
          </Link>

          <div className="flex items-center gap-3">
            {record.status === "processing" && (
              <form
                action={async () => {
                  "use server";
                  await refreshKYIFromShufti(record.id, record.reference);
                }}
              >
                <Button variant="outline" size="sm" type="submit">
                  <RefreshCw className="mr-2 h-3.5 w-3.5" /> Refresh from Shufti
                </Button>
              </form>
            )}
            {(record.status === "processing" || record.status === "requires_review") && (
              <Button asChild size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
                <Link href={`/kyi/${id}/review`}>
                  <ClipboardCheck className="mr-2 h-4 w-4" /> Review
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-7 w-7 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{String(institution?.institutionName ?? "Institution")}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{String(institution?.institutionType ?? "—")}</p>
                <div className="mt-2">
                  <KYIStatusBadge status={record.status} />
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="text-xs text-slate-400">Reference</p>
              <code className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                {record.reference}
              </code>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">Institution Details</h2>
              <DetailRow label="Institution Name" value={institution?.institutionName} />
              <DetailRow label="Institution Type" value={institution?.institutionType} />
              <DetailRow label="Registration Number" value={institution?.registrationNumber} />
              <DetailRow label="Tax ID" value={institution?.taxId} />
              <DetailRow label="Country of Incorporation" value={institution?.countryOfIncorporation} />
              <DetailRow label="Date of Incorporation" value={institution?.dateOfIncorporation} />
              <DetailRow label="Website" value={institution?.website} />
              <DetailRow label="Email" value={institution?.email} />
              <DetailRow label="Phone" value={institution?.phone} />
              <DetailRow
                label="Address"
                value={[
                  institution?.address?.street,
                  institution?.address?.city,
                  institution?.address?.state,
                  institution?.address?.postalCode,
                  institution?.address?.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">Representative</h2>
              <DetailRow label="Full Name" value={`${representative?.firstName ?? ""} ${representative?.lastName ?? ""}`.trim()} />
              <DetailRow label="Job Title" value={representative?.jobTitle} />
              <DetailRow label="Email" value={representative?.email} />
              <DetailRow label="Phone" value={representative?.phone} />
              <DetailRow label="National ID" value={representative?.nationalId} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-3">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Documents</h2>
              <div className="space-y-2 text-sm">
                <p>{documents?.certificateOfIncorporationUrl ? "✅" : "⊘"} Certificate of Incorporation</p>
                <p>{documents?.representativeIdUrl ? "✅" : "⊘"} Representative ID</p>
                <p>{documents?.memorandumUrl ? "✅" : "⊘"} Memorandum</p>
                <p>{documents?.taxCertificateUrl ? "✅" : "⊘"} Tax Certificate</p>
                <p>{documents?.regulatoryLicenseUrl ? "✅" : "⊘"} Regulatory License</p>
                <p>{documents?.proofOfAddressUrl ? "✅" : "⊘"} Proof of Address</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Verification Details</h2>
              <DetailRow label="Shufti Event" value={record.shuftiEventType} />
              <DetailRow
                label="Submitted At"
                value={record.submittedAt ? format(new Date(record.submittedAt), "MMM d, yyyy HH:mm") : undefined}
              />
              <DetailRow
                label="Reviewed At"
                value={record.reviewedAt ? format(new Date(record.reviewedAt), "MMM d, yyyy HH:mm") : undefined}
              />

              {record.shuftiVerificationUrl && (
                <a
                  href={record.shuftiVerificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 hover:underline"
                >
                  View on Shufti Pro <ExternalLink className="h-3 w-3" />
                </a>
              )}

              <div className="pt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FileCheck2 className="h-3.5 w-3.5" /> Status updates are synced from webhook and manual refresh.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
