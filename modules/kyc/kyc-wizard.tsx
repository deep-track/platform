"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
  KYCWizardData,
  PersonalInfoData,
  DocumentUploadData,
} from "@/lib/kyc-types";
import { submitKYC } from "@/actions/kyc";
import { PersonalInfoStep } from "@/modules/kyc/steps/personal-info-step";
import { DocumentUploadStep } from "@/modules/kyc/steps/document-upload-step";
import { ReviewStep } from "@/modules/kyc/steps/review-step";
import { CheckCircle, User, FileText, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface KYCWizardProps {
  invitationToken?: string;
  prefillEmail?: string;
}

const STEPS = [
  { id: 0, title: "Personal Info", icon: User, shortTitle: "Personal" },
  { id: 1, title: "Document Type", icon: FileText, shortTitle: "Document" },
  { id: 2, title: "Review & Submit", icon: ClipboardCheck, shortTitle: "Review" },
];

export function KYCWizard({ invitationToken, prefillEmail }: KYCWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<KYCWizardData>({});
  const [, setSubmittedKycId] = useState<string | null>(null);
  const [, setSubmittedRef] = useState<string | null>(null);

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

  async function handleSubmit() {
    if (!data.personalInfo || !data.document) {
      toast.error("Please complete all steps before submitting.");
      return;
    }

    const result = await submitKYC({
      personalInfo: data.personalInfo,
      document: data.document,
      selfie: { selfieUrl: "" },
      invitationToken,
    });

    if (!result.success) {
      toast.error(result.error ?? "Submission failed. Please try again.");
      return;
    }

    setSubmittedKycId(result.data.kycId);
    setSubmittedRef(result.data.reference);
    toast.success("Redirecting to secure verification...");
    setTimeout(() => {
      window.location.href = result.data.verificationUrl;
    }, 1000);
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
          <ReviewStep
            data={data}
            onSubmit={handleSubmit}
            onBack={() => setCurrentStep(1)}
            onEdit={(step: number) => setCurrentStep(step)}
          />
        )}
      </div>
    </div>
  );
}
