"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { kycSubmissionSchema, type KYCSubmissionData } from "@/lib/kyc-types";
import { uploadFiles } from "@/lib/uploadthing";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentCaptureStepProps {
  defaultValues?: Partial<KYCSubmissionData>;
  onNext: (data: Pick<KYCSubmissionData, "documentType" | "documentFrontUrl" | "documentBackUrl" | "documentFrontBase64" | "documentBackBase64">) => void;
}

const schema = kycSubmissionSchema.pick({
  documentType: true,
  documentFrontUrl: true,
  documentBackUrl: true,
  documentFrontBase64: true,
  documentBackBase64: true,
  selfieUrl: true,
  selfieBase64: true,
});

const DOCUMENT_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "id_card", label: "National ID" },
  { value: "driving_license", label: "Driver's License" },
] as const;

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
  if (!url) {
    throw new Error("Upload failed");
  }

  return { url, base64 };
}

export function DocumentCaptureStep({ defaultValues, onNext }: DocumentCaptureStepProps) {
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);

  const form = useForm<Pick<KYCSubmissionData, "documentType" | "documentFrontUrl" | "documentBackUrl" | "documentFrontBase64" | "documentBackBase64" | "selfieUrl" | "selfieBase64">>({
    resolver: zodResolver(schema),
    defaultValues: {
      documentType: defaultValues?.documentType,
      documentFrontUrl: defaultValues?.documentFrontUrl ?? "",
      documentBackUrl: defaultValues?.documentBackUrl ?? "",
      documentFrontBase64: defaultValues?.documentFrontBase64 ?? "",
      documentBackBase64: defaultValues?.documentBackBase64 ?? "",
      selfieUrl: defaultValues?.selfieUrl ?? "placeholder",
      selfieBase64: defaultValues?.selfieBase64 ?? "placeholder",
    },
  });

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit((values) =>
          onNext({
            documentType: values.documentType,
            documentFrontUrl: values.documentFrontUrl,
            documentBackUrl: values.documentBackUrl,
            documentFrontBase64: values.documentFrontBase64,
            documentBackBase64: values.documentBackBase64,
          }),
        )}
      >
        <FormField
          control={form.control}
          name="documentType"
          render={({ field }) => (
            <FormItem>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DOCUMENT_TYPES.map((documentType) => (
                  <button
                    key={documentType.value}
                    type="button"
                    onClick={() => field.onChange(documentType.value)}
                    className={cn(
                      "rounded-lg border-2 p-4 text-left transition-all",
                      field.value === documentType.value
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                        : "border-slate-200 dark:border-slate-700",
                    )}
                  >
                    <p className="font-medium text-sm">{documentType.label}</p>
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="documentFrontUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 p-3 text-sm cursor-pointer hover:border-violet-500">
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*,.pdf"
                    disabled={uploadingFront}
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setUploadingFront(true);
                      try {
                        const result = await uploadAndEncode(file);
                        field.onChange(result.url);
                        form.setValue("documentFrontBase64", result.base64, { shouldValidate: true });
                      } catch {
                        form.setError("documentFrontUrl", { message: "Failed to upload front image" });
                      } finally {
                        setUploadingFront(false);
                      }
                    }}
                  />
                  <Upload className="h-4 w-4" />
                  {uploadingFront ? "Uploading front..." : field.value ? "Replace front image" : "Upload front image"}
                </label>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="documentBackUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 p-3 text-sm cursor-pointer hover:border-violet-500">
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*,.pdf"
                    disabled={uploadingBack}
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setUploadingBack(true);
                      try {
                        const result = await uploadAndEncode(file);
                        field.onChange(result.url);
                        form.setValue("documentBackBase64", result.base64, { shouldValidate: true });
                      } catch {
                        form.setError("documentBackUrl", { message: "Failed to upload back image" });
                      } finally {
                        setUploadingBack(false);
                      }
                    }}
                  />
                  <Upload className="h-4 w-4" />
                  {uploadingBack ? "Uploading back..." : field.value ? "Replace back image" : "Upload back image (optional)"}
                </label>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white">
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
