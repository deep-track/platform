"use client";

import { useState } from "react";
import { uploadFiles } from "@/lib/uploadthing";
import { type KYISubmissionData } from "@/lib/kyi-types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Upload } from "lucide-react";

interface InvestorFinancialDocsStepProps {
  defaultValues?: Partial<KYISubmissionData>;
  onBack: () => void;
  onSubmit: (data: Pick<KYISubmissionData, "bankStatementUrl" | "proofOfAddressUrl" | "proofOfNetWorthUrl" | "accreditationLetterUrl" | "sourceOfFundsDocUrl" | "corporateDocUrl">) => Promise<void>;
}

async function upload(file: File) {
  const uploaded = await uploadFiles("kycUploader", { files: [file] });
  return uploaded[0]?.ufsUrl ?? uploaded[0]?.url ?? "";
}

export function InvestorFinancialDocsStep({ defaultValues, onBack, onSubmit }: InvestorFinancialDocsStepProps) {
  const [bankStatementUrl, setBankStatementUrl] = useState(defaultValues?.bankStatementUrl ?? "");
  const [proofOfAddressUrl, setProofOfAddressUrl] = useState(defaultValues?.proofOfAddressUrl ?? "");
  const [proofOfNetWorthUrl, setProofOfNetWorthUrl] = useState(defaultValues?.proofOfNetWorthUrl ?? "");
  const [accreditationLetterUrl, setAccreditationLetterUrl] = useState(defaultValues?.accreditationLetterUrl ?? "");
  const [sourceOfFundsDocUrl, setSourceOfFundsDocUrl] = useState(defaultValues?.sourceOfFundsDocUrl ?? "");
  const [corporateDocUrl, setCorporateDocUrl] = useState(defaultValues?.corporateDocUrl ?? "");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileField = async (setter: (value: string) => void, file?: File) => {
    if (!file) return;
    const url = await upload(file);
    setter(url);
  };

  return (
    <div className="space-y-4">
      {[
        { label: "Bank statement", required: true, setter: setBankStatementUrl },
        { label: "Proof of address", required: true, setter: setProofOfAddressUrl },
        { label: "Proof of net worth", required: false, setter: setProofOfNetWorthUrl },
        { label: "Accreditation letter", required: false, setter: setAccreditationLetterUrl },
        { label: "Source of funds document", required: false, setter: setSourceOfFundsDocUrl },
        { label: "Corporate document", required: false, setter: setCorporateDocUrl },
      ].map((field) => (
        <label key={field.label} className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 p-3 text-sm cursor-pointer hover:border-violet-500">
          <input
            type="file"
            className="sr-only"
            accept="image/*,.pdf"
            onChange={(event) => fileField(field.setter, event.target.files?.[0])}
          />
          <Upload className="h-4 w-4" />
          Upload {field.label}{field.required ? " *" : ""}
        </label>
      ))}

      <label className="flex items-start gap-3">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 h-4 w-4" />
        <span className="text-sm">I consent to automated verification checks.</span>
      </label>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          type="button"
          disabled={!consent || !bankStatementUrl || !proofOfAddressUrl || submitting}
          className="bg-violet-600 hover:bg-violet-700 text-white"
          onClick={async () => {
            setSubmitting(true);
            try {
              await onSubmit({
                bankStatementUrl,
                proofOfAddressUrl,
                proofOfNetWorthUrl,
                accreditationLetterUrl,
                sourceOfFundsDocUrl,
                corporateDocUrl,
              });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <Send className="mr-2 h-4 w-4" /> Submit Verification
        </Button>
      </div>
    </div>
  );
}
