import { notFound } from "next/navigation";
import Link from "next/link";
import { getKYIRecord, refreshKYIFromShufti } from "@/actions/kyi";
import { KYIStatusBadge } from "@/modules/kyi/kyi-status-badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  RefreshCw,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
  ClipboardCheck,
  DollarSign,
  ShieldAlert,
  FileCheck2,
} from "lucide-react";
import { format } from "date-fns";

interface KYIDetailPageProps {
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

function RiskBadge({ score }: { score?: number | null }) {
  if (score === undefined || score === null) {
    return <span className="text-sm text-slate-500 dark:text-slate-400">—</span>;
  }

  if (score <= 30) {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        Low ({score})
      </span>
    );
  }

  if (score <= 60) {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        Medium ({score})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      High ({score})
    </span>
  );
}

export default async function KYIDetailPage({ params }: KYIDetailPageProps) {
  const { id } = await params;
  const result = await getKYIRecord(id);

  if (!result.success || !result.data) notFound();

  const record = result.data;
  const profile = record.investorProfile;
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
                <TrendingUp className="h-7 w-7 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {[profile?.firstName, profile?.middleName, profile?.lastName].filter(Boolean).join(" ") || record.userName}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                  {record.investorType?.replace(/_/g, " ")} • {record.accreditationStatus}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <KYIStatusBadge status={record.status} />
                  {record.isPEP && (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      PEP
                    </span>
                  )}
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
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-400" /> Investor Profile
              </h2>
              {profile && (
                <>
                  <DetailRow label="Full Name" value={[profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(" ")} icon={TrendingUp} />
                  <DetailRow label="Date of Birth" value={profile.dateOfBirth} icon={Calendar} />
                  <DetailRow label="Nationality" value={profile.nationality} />
                  <DetailRow label="Country of Residence" value={profile.countryOfResidence} />
                  <DetailRow label="Email" value={profile.email} icon={Mail} />
                  <DetailRow label="Phone" value={profile.phone} icon={Phone} />
                  <DetailRow
                    label="Address"
                    value={[
                      profile.address.street,
                      profile.address.city,
                      profile.address.state,
                      profile.address.postalCode,
                      profile.address.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    icon={MapPin}
                  />
                </>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-400" /> Investment Details
              </h2>
              <DetailRow label="Investor Type" value={record.investorType?.replace(/_/g, " ")} />
              <DetailRow label="Accreditation" value={record.accreditationStatus} />
              <DetailRow
                label="Investment Amount"
                value={`${record.investmentAmount ?? ""} ${profile?.investmentCurrency ?? ""}`.trim()}
              />
              <DetailRow label="Source of Funds" value={record.sourceOfFunds?.replace(/_/g, " ")} />
              {profile?.sourceOfFundsDetails && (
                <DetailRow label="Source of Funds Details" value={profile.sourceOfFundsDetails} />
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-slate-400" /> Compliance
              </h2>
              <div className="space-y-3">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  PEP: {record.isPEP ? <span className="text-amber-600 dark:text-amber-400 font-medium">Yes</span> : <span className="text-emerald-600 dark:text-emerald-400 font-medium">No</span>}
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Criminal Record: {profile?.hasCriminalRecord ? <span className="text-red-600 dark:text-red-400 font-medium">Yes</span> : <span className="text-emerald-600 dark:text-emerald-400 font-medium">No</span>}
                </p>
                {profile?.pepDetails && <DetailRow label="PEP Details" value={profile.pepDetails} />}
                {profile?.criminalRecordDetails && <DetailRow label="Criminal Record Details" value={profile.criminalRecordDetails} />}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-slate-400" /> Documents
              </h2>
              <div className="space-y-2 text-sm">
                <p>{documents?.governmentIdUrl ? "✅" : "⊘"} Government ID</p>
                {documents?.governmentIdUrl && <a className="text-xs text-violet-600 hover:underline block" target="_blank" rel="noopener noreferrer" href={documents.governmentIdUrl}>View Government ID</a>}
                <p>{documents?.bankStatementUrl ? "✅" : "⊘"} Bank Statement</p>
                {documents?.bankStatementUrl && <a className="text-xs text-violet-600 hover:underline block" target="_blank" rel="noopener noreferrer" href={documents.bankStatementUrl}>View Bank Statement</a>}
                <p>{documents?.proofOfAddressUrl ? "✅" : "⊘"} Proof of Address</p>
                {documents?.proofOfAddressUrl && <a className="text-xs text-violet-600 hover:underline block" target="_blank" rel="noopener noreferrer" href={documents.proofOfAddressUrl}>View Proof of Address</a>}
                <p>{documents?.proofOfNetWorthUrl ? "✅" : "⊘"} Proof of Net Worth</p>
                <p>{documents?.accreditationLetterUrl ? "✅" : "⊘"} Accreditation Letter</p>
                <p>{documents?.sourceOfFundsDocUrl ? "✅" : "⊘"} Source of Funds Doc</p>
                <p>{documents?.corporateDocUrl ? "✅" : "⊘"} Corporate Documents</p>
              </div>
            </div>

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
                <div>
                  <p className="text-xs text-slate-500">Risk Score</p>
                  <div className="mt-1">
                    <RiskBadge score={record.riskScore} />
                  </div>
                </div>
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
