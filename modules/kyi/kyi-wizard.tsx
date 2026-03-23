"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, ClipboardCheck, FileCheck2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InvestorDocumentsData, InvestorProfileData, KYIStatus, KYIWizardData } from "@/lib/kyi-types";
import { submitKYI, getKYIRecord } from "@/actions/kyi";
import { InvestorProfileStep } from "@/modules/kyi/steps/investor-profile-step";
import { InvestorDocumentsStep } from "@/modules/kyi/steps/investor-documents-step";
import { KYIReviewStep } from "@/modules/kyi/steps/kyi-review-step";
import { KYIStatusBadge } from "@/modules/kyi/kyi-status-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface KYIWizardProps {
  invitationToken?: string;
}

const STEPS = [
  { id: 0, title: "Investor Profile", icon: User, shortTitle: "Profile" },
  { id: 1, title: "Documents", icon: FileCheck2, shortTitle: "Documents" },
  { id: 2, title: "Review & Submit", icon: ClipboardCheck, shortTitle: "Review" },
];

export function KYIWizard({ invitationToken }: KYIWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<KYIWizardData>({});
  const [completed, setCompleted] = useState(false);
  const [liveStatus, setLiveStatus] = useState<KYIStatus>("processing");
  const [submittedKyiId, setSubmittedKyiId] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const pollRef = useRef<NodeJS.Timeout | null>(null);

  function handleProfile(info: InvestorProfileData) {
    setData((previous) => ({ ...previous, investorProfile: info }));
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDocuments(documents: InvestorDocumentsData) {
    setData((previous) => ({ ...previous, documents }));
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    if (!data.investorProfile || !data.documents) {
      toast.error("Please complete all steps before submitting.");
      return;
    }

    const result = await submitKYI({
      investorProfile: data.investorProfile,
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
        window.location.href = result.data.verificationUrl;
      }, 1000);
      return;
    }

    setCompleted(true);
    setLiveStatus("processing");
  }

  useEffect(() => {
    if (!completed || !submittedKyiId) return;

    pollRef.current = setInterval(async () => {
      const res = await getKYIRecord(submittedKyiId);
      if (!res.success || !res.data) return;

      const status = res.data.status;
      setLiveStatus(status);

      if (["approved", "declined", "expired"].includes(status)) {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [completed, submittedKyiId]);

  if (completed) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <CheckCircle className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verification Submitted</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Reference: <code className="font-mono">{submittedRef}</code></p>
        <div className="flex justify-center">
          <KYIStatusBadge status={liveStatus} />
        </div>
        <div className="pt-2">
          <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white">
            <Link href="/kyi">Back to KYI Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                    index < currentStep
                      ? "bg-violet-600 border-violet-600 text-white"
                      : index === currentStep
                      ? "border-violet-600 text-violet-600 bg-white dark:bg-slate-900"
                      : "border-slate-300 dark:border-slate-600 text-slate-400 bg-white dark:bg-slate-900",
                  )}
                >
                  {index < currentStep ? <CheckCircle className="h-5 w-5" /> : <step.icon className="h-4 w-4" />}
                </div>
                <span
                  className={cn(
                    "mt-1.5 text-xs font-medium hidden sm:block",
                    index === currentStep
                      ? "text-violet-600 dark:text-violet-400"
                      : index < currentStep
                      ? "text-violet-500"
                      : "text-slate-400 dark:text-slate-500",
                  )}
                >
                  {step.shortTitle}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-3 mb-4">
                  <div
                    className={cn(
                      "h-0.5 w-full transition-all duration-300",
                      index < currentStep ? "bg-violet-500" : "bg-slate-200 dark:bg-slate-700",
                    )}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{STEPS[currentStep].title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Step {currentStep + 1} of {STEPS.length}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sm:p-8">
        {currentStep === 0 && <InvestorProfileStep defaultValues={data.investorProfile} onNext={handleProfile} />}

        {currentStep === 1 && (
          <InvestorDocumentsStep
            defaultValues={data.documents}
            onNext={handleDocuments}
            onBack={() => setCurrentStep(0)}
          />
        )}

        {currentStep === 2 && (
          <KYIReviewStep
            data={data}
            onSubmit={handleSubmit}
            onBack={() => setCurrentStep(1)}
            onEdit={(step) => setCurrentStep(step)}
          />
        )}
      </div>
    </div>
  );
}
