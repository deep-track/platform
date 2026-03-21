"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { KYCWizardData, PersonalInfoData, DocumentUploadData, SelfieData } from "@/lib/kyc-types";
import { submitKYC } from "@/actions/kyc";
import { PersonalInfoStep } from "@/modules/kyc/steps/personal-info-step";
import { DocumentUploadStep } from "@/modules/kyc/steps/document-upload-step";
import { SelfieStep } from "@/modules/kyc/steps/selfie-step";
import { ReviewStep } from "@/modules/kyc/steps/review-step";
import { CheckCircle, User, FileText, Camera, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface KYCWizardProps {
  invitationToken?: string;
  prefillEmail?: string;
}

const STEPS = [
  { id: 0, title: "Personal Info", icon: User, shortTitle: "Personal" },
  { id: 1, title: "Document Upload", icon: FileText, shortTitle: "Document" },
  { id: 2, title: "Selfie", icon: Camera, shortTitle: "Selfie" },
  { id: 3, title: "Review & Submit", icon: ClipboardCheck, shortTitle: "Review" },
];

export function KYCWizard({ invitationToken, prefillEmail }: KYCWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<KYCWizardData>({});
  const [completed, setCompleted] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  function handlePersonalInfo(info: PersonalInfoData) {
    setData((d) => ({ ...d, personalInfo: info }));
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDocument(doc: DocumentUploadData) {
    setData((d) => ({ ...d, document: doc }));
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSelfie(selfie: SelfieData) {
    setData((d) => ({ ...d, selfie: selfie }));
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    if (!data.personalInfo || !data.document || !data.selfie) {
      toast.error("Please complete all steps before submitting.");
      return;
    }

    const result = await submitKYC({
      personalInfo: data.personalInfo,
      document: data.document,
      selfie: data.selfie,
      invitationToken,
    });

    if (!result.success) {
      toast.error(result.error ?? "Submission failed. Please try again.");
      return;
    }

    setSubmittedRef(result.data.reference);

    // If Shufti returned a hosted liveness URL, redirect there
    if (result.data.verificationUrl) {
      toast.success("Redirecting to liveness verification…");
      setTimeout(() => {
        window.location.href = result.data.verificationUrl!;
      }, 1200);
      return;
    }

    // No liveness URL — image_only path, show success screen
    setCompleted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 space-y-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="absolute -inset-2 rounded-full bg-emerald-500/10 animate-ping" />
        </div>

        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verification Submitted!</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Your identity verification has been submitted to Shufti Pro for processing.
          </p>
          {submittedRef && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Reference:</span>
              <code className="text-xs font-mono text-slate-700 dark:text-slate-300">{submittedRef}</code>
            </div>
          )}
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-6 py-2.5 transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => router.push("/kyc")}
            className="rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium px-6 py-2.5 transition-colors"
          >
            View All Verifications
          </button>
        </div>
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
                  {idx < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
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
                  <div
                    className={cn(
                      "h-0.5 w-full transition-all duration-300",
                      idx < currentStep ? "bg-violet-500" : "bg-slate-200 dark:bg-slate-700",
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
        {currentStep === 0 && (
          <PersonalInfoStep
            defaultValues={prefillEmail ? { ...data.personalInfo, email: prefillEmail } : data.personalInfo}
            onNext={handlePersonalInfo}
          />
        )}
        {currentStep === 1 && (
          <DocumentUploadStep
            defaultValues={data.document}
            onNext={handleDocument}
            onBack={() => setCurrentStep(0)}
          />
        )}
        {currentStep === 2 && (
          <SelfieStep defaultValues={data.selfie} onNext={handleSelfie} onBack={() => setCurrentStep(1)} />
        )}
        {currentStep === 3 && (
          <ReviewStep
            data={data}
            onSubmit={handleSubmit}
            onBack={() => setCurrentStep(2)}
            onEdit={(step: number) => setCurrentStep(step)}
          />
        )}
      </div>
    </div>
  );
}
