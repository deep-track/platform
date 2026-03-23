"use client";

import { useState } from "react";
import type { KYIWizardData } from "@/lib/kyi-types";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Send,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  FileCheck2,
  Edit2,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface KYIReviewStepProps {
  data: KYIWizardData;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  onEdit: (step: number) => void;
}

function ReviewSection({
  title,
  icon: Icon,
  step,
  onEdit,
  children,
}: {
  title: string;
  icon: React.ElementType;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <Icon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</span>
        </div>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 font-medium transition-colors"
        >
          <Edit2 className="h-3.5 w-3.5" /> Edit
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4">
      <span className="text-xs text-slate-500 dark:text-slate-400 sm:w-44 flex-shrink-0">{label}</span>
      <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">{value}</span>
    </div>
  );
}

export function KYIReviewStep({ data, onSubmit, onBack, onEdit }: KYIReviewStepProps) {
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const profile = data.investorProfile;
  const documents = data.documents;

  async function handleSubmit() {
    if (!agreed) return;
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  }

  const fullName = profile
    ? [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(" ")
    : "";

  const address = profile
    ? [
        profile.address.street,
        profile.address.city,
        profile.address.state,
        profile.address.postalCode,
        profile.address.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  const sourceOfFundsLabel: Record<string, string> = {
    employment_income: "Employment Income",
    business_income: "Business Income",
    investment_returns: "Investment Returns",
    inheritance: "Inheritance",
    property_sale: "Property Sale",
    savings: "Savings",
    other: "Other",
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Review Your Investor Information</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Please verify all details before submitting.</p>
      </div>

      {profile && (
        <ReviewSection title="Investor Profile" icon={TrendingUp} step={0} onEdit={onEdit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
            <ReviewRow label="Full Name" value={fullName} />
            <ReviewRow label="Date of Birth" value={profile.dateOfBirth} />
            <ReviewRow label="Nationality" value={profile.nationality} />
            <ReviewRow label="Country of Residence" value={profile.countryOfResidence} />
            <ReviewRow label="Email" value={profile.email} />
            <ReviewRow label="Phone" value={profile.phone} />
            <div className="sm:col-span-2">
              <ReviewRow label="Address" value={address} />
            </div>
          </div>
        </ReviewSection>
      )}

      {profile && (
        <ReviewSection title="Investment Details" icon={DollarSign} step={0} onEdit={onEdit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
            <ReviewRow label="Investor Type" value={profile.investorType.replace(/_/g, " ")} />
            <ReviewRow label="Accreditation Status" value={profile.accreditationStatus} />
            <ReviewRow label="Investment Amount" value={`${profile.investmentAmount} ${profile.investmentCurrency}`} />
            <ReviewRow label="Source of Funds" value={sourceOfFundsLabel[profile.sourceOfFunds] ?? profile.sourceOfFunds} />
            {profile.sourceOfFundsDetails && (
              <div className="sm:col-span-2">
                <ReviewRow label="Source Details" value={profile.sourceOfFundsDetails} />
              </div>
            )}
          </div>
        </ReviewSection>
      )}

      {profile && (
        <ReviewSection title="Compliance" icon={ShieldAlert} step={0} onEdit={onEdit}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 w-40">PEP Status</span>
              <span className={profile.isPEP ? "text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "text-sm font-medium text-emerald-600 dark:text-emerald-400"}>
                {profile.isPEP ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 w-40">Criminal Record</span>
              <span className={profile.hasCriminalRecord ? "text-sm font-medium text-red-600 dark:text-red-400" : "text-sm font-medium text-emerald-600 dark:text-emerald-400"}>
                {profile.hasCriminalRecord ? "Yes" : "No"}
              </span>
            </div>
            {profile.pepDetails && <ReviewRow label="PEP Details" value={profile.pepDetails} />}
            {profile.criminalRecordDetails && (
              <ReviewRow label="Criminal Record Details" value={profile.criminalRecordDetails} />
            )}
          </div>
        </ReviewSection>
      )}

      {documents && (
        <ReviewSection title="Documents" icon={FileCheck2} step={1} onEdit={onEdit}>
          <div className="space-y-2 text-sm">
            <p className="text-emerald-700 dark:text-emerald-400">✅ Government ID (required)</p>
            <p className="text-emerald-700 dark:text-emerald-400">✅ Bank Statement (required)</p>
            <p className="text-emerald-700 dark:text-emerald-400">✅ Proof of Address (required)</p>
            <p className={documents.proofOfNetWorthUrl ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}>{documents.proofOfNetWorthUrl ? "✅" : "○"} Proof of Net Worth (optional)</p>
            <p className={documents.accreditationLetterUrl ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}>{documents.accreditationLetterUrl ? "✅" : "○"} Accreditation Letter (optional)</p>
            <p className={documents.sourceOfFundsDocUrl ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}>{documents.sourceOfFundsDocUrl ? "✅" : "○"} Source of Funds Doc (optional)</p>
            <p className={documents.corporateDocUrl ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}>{documents.corporateDocUrl ? "✅" : "○"} Corporate Documents (optional)</p>
          </div>
        </ReviewSection>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Consent & Declaration</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          I declare that all information provided is true and accurate. I consent to identity verification, AML
          screening, and source of funds checks being conducted on my submitted information and documents in accordance
          with applicable financial regulations.
        </p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">I confirm and consent to proceed.</span>
        </label>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!agreed || submitting}
          className="bg-violet-600 hover:bg-violet-700 text-white px-8"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Verification
            </>
          )}
        </Button>
      </div>

      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 p-4 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
        <CheckCircle className="h-4 w-4 mt-0.5" />
        All submitted data is encrypted and handled according to compliance standards.
      </div>
    </div>
  );
}
