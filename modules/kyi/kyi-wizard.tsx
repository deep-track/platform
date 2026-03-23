"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
  KYIStatus,
  KYIWizardData,
  InstitutionInfoData,
  RepresentativeInfoData,
  InstitutionDocumentsData,
} from "@/lib/kyi-types";
import { getKYIRecord, submitKYI } from "@/actions/kyi";
import { InstitutionInfoStep } from "@/modules/kyi/steps/institution-info-step";
import { RepresentativeInfoStep } from "@/modules/kyi/steps/representative-info-step";
import { InstitutionDocumentsStep } from "@/modules/kyi/steps/institution-documents-step";
import { KYIReviewStep } from "@/modules/kyi/steps/kyi-review-step";
import {
  Building2,
  UserCheck,
  FileCheck2,
  ClipboardCheck,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KYIWizardProps {
  invitationToken?: string;
}

const STEPS = [
  { id: 0, title: "Institution Info", icon: Building2, shortTitle: "Institution" },
  { id: 1, title: "Representative", icon: UserCheck, shortTitle: "Representative" },
  { id: 2, title: "Documents", icon: FileCheck2, shortTitle: "Documents" },
  { id: 3, title: "Review & Submit", icon: ClipboardCheck, shortTitle: "Review" },
];

export function KYIWizard({ invitationToken }: KYIWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<KYIWizardData>({});
  const [completed, setCompleted] = useState(false);
  const [liveStatus, setLiveStatus] = useState<KYIStatus>("processing");
  const [submittedKyiId, setSubmittedKyiId] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    if (!completed || !submittedKyiId) return;
    if (liveStatus === "approved" || liveStatus === "declined") return;

    const checkStatus = async () => {
      const result = await getKYIRecord(submittedKyiId);
      if (result.success && result.data) {
        setLiveStatus(result.data.status);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [completed, submittedKyiId, liveStatus]);

  function handleInstitutionInfo(institutionInfo: InstitutionInfoData) {
    setData((prev) => ({ ...prev, institutionInfo }));
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRepresentative(representative: RepresentativeInfoData) {
    setData((prev) => ({ ...prev, representative }));
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDocuments(documents: InstitutionDocumentsData) {
    setData((prev) => ({ ...prev, documents }));
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    if (!data.institutionInfo || !data.representative || !data.documents) {
      toast.error("Please complete all steps before submitting.");
      return;
    }

    const result = await submitKYI({
      institutionInfo: data.institutionInfo,
      representative: data.representative,
      documents: data.documents,
      invitationToken,
    });

    if (!result.success) {
      toast.error(result.error ?? "Submission failed. Please try again.");
      return;
    }

    setSubmittedKyiId(result.data.kyiId);
    setSubmittedRef(result.data.reference);

    if (result.data.verificationUrl) {
      toast.success("Redirecting to secure verification...");
      setTimeout(() => {
        window.location.href = result.data.verificationUrl!;
      }, 1000);
      return;
    }

    setCompleted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 space-y-6">
        <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verification Submitted!</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Your institution verification has been submitted for processing.
          </p>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Current status: {liveStatus}</p>
          {submittedRef && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Reference:</span>
              <code className="text-xs font-mono text-slate-700 dark:text-slate-300">{submittedRef}</code>
            </div>
          )}
        </div>
        <button
          onClick={() => router.push("/kyi")}
          className="rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-6 py-2.5 transition-colors"
        >
          Go to KYI Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                    idx < currentStep
                      ? "bg-violet-600 border-violet-600 text-white"
                      : idx === currentStep
                        ? "border-violet-600 text-violet-600 bg-white dark:bg-slate-900"
                        : "border-slate-300 dark:border-slate-600 text-slate-400 bg-white dark:bg-slate-900",
                  )}
                >
                  {idx < currentStep ? <CheckCircle className="h-5 w-5" /> : <step.icon className="h-4 w-4" />}
                </div>
                <span
                  className={cn(
                    "mt-1.5 text-xs font-medium hidden sm:block",
                    idx === currentStep
                      ? "text-violet-600 dark:text-violet-400"
                      : idx < currentStep
                        ? "text-violet-500"
                        : "text-slate-400 dark:text-slate-500",
                  )}
                >
                  {step.shortTitle}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-3 mb-4">
                  <div className={cn("h-0.5 w-full transition-all duration-300", idx < currentStep ? "bg-violet-500" : "bg-slate-200 dark:bg-slate-700")} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{STEPS[currentStep].title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Step {currentStep + 1} of {STEPS.length}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sm:p-8">
        {currentStep === 0 && <InstitutionInfoStep defaultValues={data.institutionInfo} onNext={handleInstitutionInfo} />}
        {currentStep === 1 && <RepresentativeInfoStep defaultValues={data.representative} onNext={handleRepresentative} onBack={() => setCurrentStep(0)} />}
        {currentStep === 2 && <InstitutionDocumentsStep defaultValues={data.documents} onNext={handleDocuments} onBack={() => setCurrentStep(1)} />}
        {currentStep === 3 && <KYIReviewStep data={data} onSubmit={handleSubmit} onBack={() => setCurrentStep(2)} onEdit={(step) => setCurrentStep(step)} />}
      </div>
    </div>
  );
}
