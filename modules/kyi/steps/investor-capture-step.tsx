"use client";

import { useState } from "react";
import { uploadFiles } from "@/lib/uploadthing";
import { type KYISubmissionData } from "@/lib/kyi-types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Upload } from "lucide-react";

interface InvestorCaptureStepProps {
  defaultValues?: Partial<KYISubmissionData>;
  onNext: (data: Pick<KYISubmissionData, "governmentIdUrl" | "governmentIdBase64" | "selfieUrl" | "selfieBase64">) => void;
  onBack: () => void;
}

async function uploadAndEncode(file: File) {
  const [base64, uploaded] = await Promise.all([
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }),
    uploadFiles("kycUploader", { files: [file] }),
  ]);

  const url = uploaded[0]?.ufsUrl ?? uploaded[0]?.url;
  if (!url) throw new Error("Upload failed");
  return { url, base64 };
}

export function InvestorCaptureStep({ defaultValues, onNext, onBack }: InvestorCaptureStepProps) {
  const [governmentIdUrl, setGovernmentIdUrl] = useState(defaultValues?.governmentIdUrl ?? "");
  const [governmentIdBase64, setGovernmentIdBase64] = useState(defaultValues?.governmentIdBase64 ?? "");
  const [selfieUrl, setSelfieUrl] = useState(defaultValues?.selfieUrl ?? "");
  const [selfieBase64, setSelfieBase64] = useState(defaultValues?.selfieBase64 ?? "");

  return (
    <div className="space-y-4">
      <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 p-4 text-sm cursor-pointer hover:border-violet-500">
        <input
          type="file"
          className="sr-only"
          accept="image/*,.pdf"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const result = await uploadAndEncode(file);
            setGovernmentIdUrl(result.url);
            setGovernmentIdBase64(result.base64);
          }}
        />
        <Upload className="h-4 w-4" />
        {governmentIdUrl ? "Replace government ID" : "Upload government ID"}
      </label>

      <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 p-4 text-sm cursor-pointer hover:border-violet-500">
        <input
          type="file"
          className="sr-only"
          accept="image/*"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const result = await uploadAndEncode(file);
            setSelfieUrl(result.url);
            setSelfieBase64(result.base64);
          }}
        />
        <Upload className="h-4 w-4" />
        {selfieUrl ? "Replace selfie" : "Upload selfie"}
      </label>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          type="button"
          onClick={() => onNext({ governmentIdUrl, governmentIdBase64, selfieUrl, selfieBase64 })}
          disabled={!governmentIdUrl || !governmentIdBase64 || !selfieUrl || !selfieBase64}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
