"use client";

import { useState } from "react";
import type { KYCWizardData } from "@/lib/kyc-types";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Send,
  User,
  FileText,
  Camera,
  CheckCircle,
  FileCheck,
  Edit2,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ReviewStepProps {
  data: KYCWizardData;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  onEdit: (step: number) => void;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  passport: "Passport",
  id_card: "National ID Card",
  driving_license: "Driver's License",
};

const GENDER_LABELS: Record<string, string> = {
  M: "Male",
  F: "Female",
  O: "Other / Prefer not to say",
};

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
      <span className="text-xs text-slate-500 dark:text-slate-400 sm:w-36 flex-shrink-0">{label}</span>
      <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">{value}</span>
    </div>
  );
}

export function ReviewStep({ data, onSubmit, onBack, onEdit }: ReviewStepProps) {
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const { personalInfo, document, selfie } = data;

  async function handleSubmit() {
    if (!agreed) return;
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  }

  const addressStr = personalInfo
    ? [
        personalInfo.address.street,
        personalInfo.address.city,
        personalInfo.address.state,
        personalInfo.address.postalCode,
        personalInfo.address.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Review Your Information</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Please verify all details before submitting.
        </p>
      </div>

      {personalInfo && (
        <ReviewSection title="Personal Information" icon={User} step={0} onEdit={onEdit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
            <ReviewRow
              label="Full Name"
              value={[personalInfo.firstName, personalInfo.middleName, personalInfo.lastName].filter(Boolean).join(" ")}
            />
            <ReviewRow label="Date of Birth" value={personalInfo.dateOfBirth} />
            <ReviewRow label="Gender" value={GENDER_LABELS[personalInfo.gender]} />
            <ReviewRow label="Nationality" value={personalInfo.nationality} />
            <ReviewRow label="Email" value={personalInfo.email} />
            <ReviewRow label="Phone" value={personalInfo.phone} />
            <div className="sm:col-span-2">
              <ReviewRow label="Address" value={addressStr} />
            </div>
          </div>
        </ReviewSection>
      )}

      {document && (
        <ReviewSection title="Identity Document" icon={FileText} step={1} onEdit={onEdit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <ReviewRow label="Document Type" value={DOC_TYPE_LABELS[document.documentType]} />
              {document.documentNumber && <ReviewRow label="Document Number" value={document.documentNumber} />}
              {document.issueDate && <ReviewRow label="Issue Date" value={document.issueDate} />}
              {document.expiryDate && <ReviewRow label="Expiry Date" value={document.expiryDate} />}
            </div>
            <div className="flex gap-3">
              {document.documentFrontUrl && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Front</p>
                  <div className="h-20 w-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {document.documentFrontUrl?.match(/\.(jpg|jpeg|png|webp)(\?|$)/i) ? (
                      <Image src={document.documentFrontUrl} alt="Document front" fill className="object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <FileCheck className="h-6 w-6 text-slate-400" />
                        <span className="text-xs text-slate-400">PDF</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {document.documentBackUrl && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Back</p>
                  <div className="h-20 w-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {document.documentBackUrl?.match(/\.(jpg|jpeg|png|webp)(\?|$)/i) ? (
                      <Image src={document.documentBackUrl} alt="Document back" fill className="object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <FileCheck className="h-6 w-6 text-slate-400" />
                        <span className="text-xs text-slate-400">PDF</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ReviewSection>
      )}

      {selfie && (
        <ReviewSection title="Selfie" icon={Camera} step={2} onEdit={onEdit}>
          <div className="flex items-center gap-4">
            <div className="h-20 w-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative flex-shrink-0">
              <Image src={selfie.selfieUrl} alt="Selfie" fill className="object-cover" />
            </div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Photo captured successfully</span>
            </div>
          </div>
        </ReviewSection>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Consent & Declaration</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          By submitting this verification, I confirm that all information provided is accurate and up to date.
        </p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            I confirm the above information is correct and I consent to identity verification processing.
          </span>
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
          className={cn("bg-violet-600 hover:bg-violet-700 text-white px-8", (!agreed || submitting) && "opacity-50 cursor-not-allowed")}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Verification
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
