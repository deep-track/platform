"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  institutionDocumentsSchema,
  type InstitutionDocumentsData,
} from "@/lib/kyi-types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, Upload, CheckCircle2 } from "lucide-react";
import { uploadFiles } from "@/lib/uploadthing";

interface InstitutionDocumentsStepProps {
  defaultValues?: Partial<InstitutionDocumentsData>;
  onNext: (data: InstitutionDocumentsData) => void;
  onBack: () => void;
}

type UploadFieldProps = {
  label: string;
  hint?: string;
  optional?: boolean;
  value?: string;
  onChange: (value: string) => void;
};

function UploadField({ label, hint, optional, value, onChange }: UploadFieldProps) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File): Promise<string> {
    const uploaded = await uploadFiles("kycUploader", { files: [file] });
    return uploaded[0].ufsUrl ?? uploaded[0].url;
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {label} {optional && <span className="text-xs text-slate-500">(optional)</span>}
        </p>
        {hint && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{hint}</p>}
      </div>

      <div className="flex items-center gap-3">
        <Input
          type="file"
          accept="image/*,application/pdf"
          disabled={uploading}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setUploading(true);
            try {
              const url = await handleUpload(file);
              onChange(url);
            } finally {
              setUploading(false);
              e.target.value = "";
            }
          }}
        />
        <Button type="button" variant="outline" disabled={uploading} className="shrink-0">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </Button>
      </div>

      {value && (
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
          <CheckCircle2 className="h-4 w-4" /> Uploaded
        </div>
      )}
    </div>
  );
}

export function InstitutionDocumentsStep({
  defaultValues,
  onNext,
  onBack,
}: InstitutionDocumentsStepProps) {
  const form = useForm<InstitutionDocumentsData>({
    resolver: zodResolver(institutionDocumentsSchema),
    defaultValues: {
      certificateOfIncorporationUrl: "",
      memorandumUrl: "",
      taxCertificateUrl: "",
      regulatoryLicenseUrl: "",
      representativeIdUrl: "",
      proofOfAddressUrl: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-5">
        <FormField
          control={form.control}
          name="certificateOfIncorporationUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <UploadField
                  label="Certificate of Incorporation"
                  hint="Official document proving legal registration"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="representativeIdUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <UploadField
                  label="Representative ID Document"
                  hint="National ID or passport of authorized representative"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="memorandumUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <UploadField
                  label="Memorandum & Articles of Association"
                  optional
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="taxCertificateUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <UploadField
                  label="Tax Compliance Certificate"
                  optional
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="regulatoryLicenseUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <UploadField
                  label="Regulatory License"
                  hint="Required for banks, insurance, and regulated entities"
                  optional
                  value={field.value}
                  onChange={field.onChange}
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
                  hint="Utility bill or bank statement (max 3 months old)"
                  optional
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-4">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            All documents must be clear, unedited, and in PDF or image format. Documents in languages other than English should include a certified translation.
          </p>
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
