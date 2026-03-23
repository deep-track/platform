"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { KYIWizardData } from "@/lib/kyi-types";
import {
  ArrowLeft,
  Send,
  Loader2,
  Building2,
  UserCheck,
  FileCheck,
  Edit2,
  CheckCircle,
} from "lucide-react";

interface KYIReviewStepProps {
  data: KYIWizardData;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  onEdit: (step: number) => void;
}

function Section({
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

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4">
      <span className="text-xs text-slate-500 dark:text-slate-400 sm:w-44 flex-shrink-0">{label}</span>
      <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">{value}</span>
    </div>
  );
}

function DocItem({ label, present }: { label: string; present: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span>{present ? "✅" : "⊘"}</span>
      <span className={present ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"}>{label}</span>
    </div>
  );
}

export function KYIReviewStep({ data, onSubmit, onBack, onEdit }: KYIReviewStepProps) {
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);

  async function handleSubmit() {
    if (!consent) return;
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  }

  const institution = data.institutionInfo;
  const representative = data.representative;
  const documents = data.documents;

  return (
    <div className="space-y-6">
      {institution && (
        <Section title="Institution Information" icon={Building2} step={0} onEdit={onEdit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
            <Row label="Institution Name" value={institution.institutionName} />
            <Row label="Institution Type" value={institution.institutionType} />
            <Row label="Registration Number" value={institution.registrationNumber} />
            <Row label="Tax ID" value={institution.taxId} />
            <Row label="Country" value={institution.countryOfIncorporation} />
            <Row label="Incorporation Date" value={institution.dateOfIncorporation} />
            <Row label="Website" value={institution.website} />
            <Row label="Email" value={institution.email} />
            <Row label="Phone" value={institution.phone} />
            <div className="sm:col-span-2">
              <Row
                label="Address"
                value={[
                  institution.address.street,
                  institution.address.city,
                  institution.address.state,
                  institution.address.postalCode,
                  institution.address.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              />
            </div>
          </div>
        </Section>
      )}

      {representative && (
        <Section title="Representative" icon={UserCheck} step={1} onEdit={onEdit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
            <Row label="Full Name" value={`${representative.firstName} ${representative.lastName}`} />
            <Row label="Job Title" value={representative.jobTitle} />
            <Row label="Email" value={representative.email} />
            <Row label="Phone" value={representative.phone} />
            <Row label="National ID" value={representative.nationalId} />
          </div>
        </Section>
      )}

      {documents && (
        <Section title="Documents" icon={FileCheck} step={2} onEdit={onEdit}>
          <div className="space-y-2">
            <DocItem label="Certificate of Incorporation" present={!!documents.certificateOfIncorporationUrl} />
            <DocItem label="Representative ID" present={!!documents.representativeIdUrl} />
            <DocItem label="Memorandum" present={!!documents.memorandumUrl} />
            <DocItem label="Tax Certificate" present={!!documents.taxCertificateUrl} />
            <DocItem label="Regulatory License" present={!!documents.regulatoryLicenseUrl} />
            <DocItem label="Proof of Address" present={!!documents.proofOfAddressUrl} />
          </div>
        </Section>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox checked={consent} onCheckedChange={(checked) => setConsent(Boolean(checked))} className="mt-0.5" />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            I confirm that all information provided is accurate, that I am authorized to submit this verification on behalf of the institution, and I consent to the processing of institutional and personal data for verification purposes.
          </span>
        </label>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={!consent || submitting} className="bg-violet-600 hover:bg-violet-700 text-white px-8">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> Submit Verification
            </>
          )}
        </Button>
      </div>

      {!consent && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <CheckCircle className="h-3.5 w-3.5" /> Please accept consent to continue.
        </div>
      )}
    </div>
  );
}
