"use client";

import { type KYISubmissionData } from "@/lib/kyi-types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface InvestorDocumentTypeStepProps {
  defaultValues?: Partial<KYISubmissionData>;
  onNext: (data: Pick<KYISubmissionData, "governmentIdType">) => void;
  onBack: () => void;
}

const TYPES: Array<{ value: KYISubmissionData["governmentIdType"]; label: string }> = [
  { value: "passport", label: "Passport" },
  { value: "national_id", label: "National ID" },
  { value: "driving_license", label: "Driver's License" },
];

export function InvestorDocumentTypeStep({ defaultValues, onNext, onBack }: InvestorDocumentTypeStepProps) {
  const [selected, setSelected] = useState<KYISubmissionData["governmentIdType"]>(defaultValues?.governmentIdType ?? "passport");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TYPES.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setSelected(item.value)}
            className={cn(
              "rounded-lg border-2 p-4 text-left transition-all",
              selected === item.value
                ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                : "border-slate-200 dark:border-slate-700",
            )}
          >
            <p className="font-medium text-sm">{item.label}</p>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="button" onClick={() => onNext({ governmentIdType: selected })} className="bg-violet-600 hover:bg-violet-700 text-white">
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
