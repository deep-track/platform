"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  investorDocumentsSchema,
  type InvestorDocumentsData,
} from "@/lib/kyi-types";
import { uploadFiles } from "@/lib/uploadthing";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, Upload, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface InvestorDocumentsStepProps {
  defaultValues?: Partial<InvestorDocumentsData>;
  onNext: (data: InvestorDocumentsData) => void;
  onBack: () => void;
}

type GovernmentDocType = "passport" | "national_id" | "driving_license";

function UploadField({
  label,
  hint,
  value,
  required,
  uploading,
  onUpload,
}: {
  label: string;
  hint: string;
  value?: string;
  required?: boolean;
  uploading: boolean;
  onUpload: (file: File) => Promise<void>;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {label} {required && <span className="text-red-500">*</span>}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{hint}</p>
      </div>

      <label className={cn("flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 p-3 text-sm transition-colors", uploading ? "bg-slate-50 dark:bg-slate-800/40" : "hover:border-violet-500 hover:text-violet-600 cursor-pointer")}>
        <input
          type="file"
          className="sr-only"
          accept="image/*,.pdf"
          disabled={uploading}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            await onUpload(file);
          }}
        />
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {uploading ? "Uploading..." : value ? "Replace file" : "Upload file"}
      </label>

      {value && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <CheckCircle className="h-3.5 w-3.5" /> Uploaded successfully
        </a>
      )}
    </div>
  );
}

const GOVERNMENT_IDS: { value: GovernmentDocType; label: string; hint: string }[] = [
  { value: "passport", label: "Passport", hint: "International travel document" },
  { value: "national_id", label: "National ID", hint: "Government-issued national ID" },
  { value: "driving_license", label: "Driving License", hint: "Valid driver’s license" },
];

export function InvestorDocumentsStep({ defaultValues, onNext, onBack }: InvestorDocumentsStepProps) {
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const form = useForm<InvestorDocumentsData>({
    resolver: zodResolver(investorDocumentsSchema),
    defaultValues: {
      governmentIdUrl: "",
      governmentIdType: "passport",
      bankStatementUrl: "",
      proofOfAddressUrl: "",
      proofOfNetWorthUrl: "",
      accreditationLetterUrl: "",
      sourceOfFundsDocUrl: "",
      corporateDocUrl: "",
      ...defaultValues,
    },
  });

  async function uploadToField(field: keyof InvestorDocumentsData, file: File) {
    try {
      setUploadingField(field);
      const uploaded = await uploadFiles("kycUploader", { files: [file] });
      if (!uploaded || uploaded.length === 0) throw new Error("Upload failed");
      form.setValue(field, uploaded[0].ufsUrl ?? uploaded[0].url, { shouldValidate: true });
    } catch {
      form.setError(field, { type: "manual", message: "Upload failed. Try again." });
    } finally {
      setUploadingField(null);
    }
  }

  const governmentIdType = form.watch("governmentIdType");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-8">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">Government ID Type</h3>
          <FormField
            control={form.control}
            name="governmentIdType"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {GOVERNMENT_IDS.map((documentType) => (
                    <button
                      key={documentType.value}
                      type="button"
                      onClick={() => field.onChange(documentType.value)}
                      className={cn(
                        "rounded-lg border-2 p-4 text-left transition-all",
                        field.value === documentType.value
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-600"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600",
                      )}
                    >
                      <div className="font-medium text-sm text-slate-800 dark:text-slate-200">{documentType.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{documentType.hint}</div>
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Selected: {GOVERNMENT_IDS.find((doc) => doc.value === governmentIdType)?.label}</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Required Documents</h3>

          <FormField
            control={form.control}
            name="governmentIdUrl"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <UploadField
                    label="Government ID"
                    hint="Matches the type selected above"
                    value={field.value}
                    required
                    uploading={uploadingField === "governmentIdUrl"}
                    onUpload={(file) => uploadToField("governmentIdUrl", file)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bankStatementUrl"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <UploadField
                    label="Bank Statement"
                    hint="Last 3 months — shows sufficient funds"
                    value={field.value}
                    required
                    uploading={uploadingField === "bankStatementUrl"}
                    onUpload={(file) => uploadToField("bankStatementUrl", file)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="proofOfAddressUrl"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <UploadField
                    label="Proof of Address"
                    hint="Utility bill or bank statement max 3 months old"
                    value={field.value}
                    required
                    uploading={uploadingField === "proofOfAddressUrl"}
                    onUpload={(file) => uploadToField("proofOfAddressUrl", file)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Optional Documents</h3>

          <FormField
            control={form.control}
            name="proofOfNetWorthUrl"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <UploadField
                    label="Proof of Net Worth / Wealth"
                    hint="For accredited investor qualification"
                    value={field.value}
                    uploading={uploadingField === "proofOfNetWorthUrl"}
                    onUpload={(file) => uploadToField("proofOfNetWorthUrl", file)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accreditationLetterUrl"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <UploadField
                    label="Accreditation Letter"
                    hint="Letter from financial advisor or regulator"
                    value={field.value}
                    uploading={uploadingField === "accreditationLetterUrl"}
                    onUpload={(file) => uploadToField("accreditationLetterUrl", file)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sourceOfFundsDocUrl"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <UploadField
                    label="Source of Funds Documentation"
                    hint="Salary slips, business accounts, sale agreement etc."
                    value={field.value}
                    uploading={uploadingField === "sourceOfFundsDocUrl"}
                    onUpload={(file) => uploadToField("sourceOfFundsDocUrl", file)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="corporateDocUrl"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <UploadField
                    label="Corporate Documents"
                    hint="Required if investing as a corporate entity or fund"
                    value={field.value}
                    uploading={uploadingField === "corporateDocUrl"}
                    onUpload={(file) => uploadToField("corporateDocUrl", file)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-4">
          <div className="flex items-start gap-2.5">
            <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Documents must be clear, unedited originals. Bank statements must show your name, account number,
              and recent transactions.
            </p>
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white px-6">
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
