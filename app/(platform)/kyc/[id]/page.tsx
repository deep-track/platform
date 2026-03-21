import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getKYCRecord, refreshKYCFromShufti } from "@/actions/kyc";
import { KYCStatusBadge } from "@/modules/kyc/kyc-status-badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  RefreshCw,
  User,
  FileText,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ExternalLink,
  ClipboardCheck,
} from "lucide-react";
import { format } from "date-fns";

interface KYCDetailPageProps {
  params: Promise<{ id: string }>;
}

function DetailRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string | null;
  icon?: React.ElementType;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      {Icon && (
        <div className="h-5 w-5 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

export default async function KYCDetailPage({ params }: KYCDetailPageProps) {
  const { id } = await params;
  const result = await getKYCRecord(id);

  if (!result.success || !result.data) notFound();

  const record = result.data;
  const { personalInfo } = record;

  const DOC_LABELS: Record<string, string> = {
    passport: "Passport",
    id_card: "National ID Card",
    driving_license: "Driver's License",
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/kyc"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to KYC
          </Link>
          <div className="flex items-center gap-3">
            <form
              action={async () => {
                "use server";
                await refreshKYCFromShufti(record.id, record.reference);
              }}
            >
              <Button variant="outline" size="sm" type="submit">
                <RefreshCw className="mr-2 h-3.5 w-3.5" /> Refresh from Shufti
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
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                <User className="h-7 w-7 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{record.userName}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{record.userEmail}</p>
                <div className="mt-2">
                  <KYCStatusBadge status={record.status} />
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="text-xs text-slate-400">Reference</p>
              <code className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                {record.reference}
              </code>
              <p className="text-xs text-slate-400 mt-1">
                Submitted {record.createdAt ? format(new Date(record.createdAt), "MMM d, yyyy") : "—"}
              </p>
            </div>
          </div>

          {record.declineReason && (
            <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 px-4 py-3">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Decline Reason</p>
              <p className="text-sm text-red-600 dark:text-red-500 mt-0.5">{record.declineReason}</p>
            </div>
          )}
          {record.reviewNotes && (
            <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 px-4 py-3">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Review Notes</p>
              <p className="text-sm text-amber-600 dark:text-amber-500 mt-0.5">{record.reviewNotes}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" /> Personal Information
              </h2>
              {personalInfo && (
                <div>
                  <DetailRow
                    label="Full Name"
                    value={[personalInfo.firstName, personalInfo.middleName, personalInfo.lastName].filter(Boolean).join(" ")}
                    icon={User}
                  />
                  <DetailRow label="Date of Birth" value={personalInfo.dateOfBirth} icon={Calendar} />
                  <DetailRow label="Gender" value={{ M: "Male", F: "Female", O: "Other" }[personalInfo.gender]} />
                  <DetailRow label="Nationality" value={personalInfo.nationality} />
                  <DetailRow label="Email" value={personalInfo.email} icon={Mail} />
                  <DetailRow label="Phone" value={personalInfo.phone} icon={Phone} />
                  <DetailRow
                    label="Address"
                    value={[
                      personalInfo.address.street,
                      personalInfo.address.city,
                      personalInfo.address.state,
                      personalInfo.address.postalCode,
                      personalInfo.address.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    icon={MapPin}
                  />
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" /> Identity Document
              </h2>
              <DetailRow label="Document Type" value={DOC_LABELS[record.documentType] ?? record.documentType} icon={FileText} />

              <div className="flex gap-4 mt-4">
                {record.documentFrontUrl && (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Front</p>
                    <div className="h-28 w-44 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative bg-slate-100 dark:bg-slate-800">
                      <Image src={record.documentFrontUrl} alt="Document front" fill className="object-cover" />
                    </div>
                  </div>
                )}
                {record.documentBackUrl && (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Back</p>
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
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">Selfie</h2>
                <div className="h-48 w-36 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative mx-auto">
                  <Image src={record.selfieUrl} alt="Selfie" fill className="object-cover" />
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Verification Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Shufti Event</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-mono mt-0.5">{record.shuftiEventType ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Submitted At</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">
                    {record.submittedAt ? format(new Date(record.submittedAt), "MMM d, yyyy HH:mm") : "—"}
                  </p>
                </div>
                {record.reviewedAt && (
                  <div>
                    <p className="text-xs text-slate-500">Reviewed At</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">
                      {format(new Date(record.reviewedAt), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                )}
                {record.shuftiVerificationUrl && (
                  <a
                    href={record.shuftiVerificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    View on Shufti Pro <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
