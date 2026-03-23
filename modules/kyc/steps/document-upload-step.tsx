"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentUploadSchema, type DocumentUploadData } from "@/lib/kyc-types";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, AlertCircle, Upload, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadFiles } from "@/lib/uploadthing";

interface DocumentUploadStepProps {
  defaultValues?: Partial<DocumentUploadData>;
  onNext: (data: DocumentUploadData) => void;
  onBack: () => void;
}

const DOCUMENT_TYPES = [
  { value: "passport", label: "Passport", hint: "Use your passport for verification" },
  { value: "id_card", label: "National ID Card", hint: "Use your national ID for verification" },
  { value: "driving_license", label: "Driver's License", hint: "Use your driver's license for verification" },
] as const;

type DocType = "passport" | "id_card" | "driving_license";

interface FileDropZoneProps {
  label: string;
  hint?: string;
  value?: string;
  base64Value?: string;
  onChange: (url: string) => void;
  onBase64Change?: (base64: string) => void;
  required?: boolean;
}

function FileDropZone({
  label,
  hint,
  value,
  base64Value,
  onChange,
  onBase64Change,
  required,
}: FileDropZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError("Please upload an image (JPG, PNG) or PDF.");
      return;
    }
    if (file.size > 16 * 1024 * 1024) {
      setError("File must be under 16MB.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      if (file.type.startsWith("image/")) {
        const dimensions = await new Promise<{ w: number; h: number }>((resolve) => {
          const image = new window.Image();
          const objectUrl = URL.createObjectURL(file);
          image.onload = () => {
            resolve({ w: image.naturalWidth, h: image.naturalHeight });
            URL.revokeObjectURL(objectUrl);
          };
          image.src = objectUrl;
        });

        if (dimensions.w < 600 || dimensions.h < 400) {
          setError(
            `Image too small (${dimensions.w}x${dimensions.h}px). Minimum 1000x600px required for document verification.`,
          );
          return;
        }
      }

      const [base64Result, uploadResult] = await Promise.all([
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
        uploadFiles("kycUploader", { files: [file] }),
      ]);

      const url = uploadResult[0]?.ufsUrl ?? uploadResult[0]?.url;
      if (!url) throw new Error("No URL from upload");

      onChange(url);
      onBase64Change?.(base64Result);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {label} {required && <span className="text-red-500">*</span>}
        </p>
        {hint && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{hint}</p>}
      </div>

      <label
        className={cn(
          "flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 p-3 text-sm transition-colors",
          uploading
            ? "bg-slate-50 dark:bg-slate-800/40"
            : "hover:border-violet-500 hover:text-violet-600 cursor-pointer",
        )}
      >
        <input
          type="file"
          className="sr-only"
          accept="image/*,.pdf"
          disabled={uploading}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            await handleFile(file);
          }}
        />
        {uploading ? (
          <span className="h-4 w-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {uploading ? "Uploading..." : value ? "Replace file" : "Upload file"}
      </label>

      {value && base64Value && (
        <div className="inline-flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="h-3.5 w-3.5" />
          Captured for secure verification and stored successfully
        </div>
      )}

      {error && (
        <div className="inline-flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}
    </div>
  );
}

export function DocumentUploadStep({ defaultValues, onNext, onBack }: DocumentUploadStepProps) {
  const form = useForm<DocumentUploadData>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      documentType: undefined,
      documentFrontUrl: "",
      documentFrontBase64: "",
      documentBackUrl: "",
      documentBackBase64: "",
      documentNumber: "",
      expiryDate: "",
      issueDate: "",
      ...defaultValues,
    },
  });

  const selectedDocType = form.watch("documentType") as DocType | undefined;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onNext(values))}
        className="space-y-8"
      >
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
            Document Type
          </h3>
          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {DOCUMENT_TYPES.map((doc) => (
                    <button
                      key={doc.value}
                      type="button"
                      onClick={() => field.onChange(doc.value)}
                      className={cn(
                        "rounded-lg border-2 p-4 text-left transition-all",
                        field.value === doc.value
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-600"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600",
                      )}
                    >
                      <div className="font-medium text-sm text-slate-800 dark:text-slate-200">{doc.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{doc.hint}</div>
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="documentFrontUrl"
            render={({ field }) => (
              <FormItem>
                <FileDropZone
                  label="Front Side"
                  hint="Clear image of the front side"
                  value={field.value}
                  base64Value={form.watch("documentFrontBase64")}
                  onChange={field.onChange}
                  onBase64Change={(b64) =>
                    form.setValue("documentFrontBase64", b64, { shouldValidate: true })
                  }
                  required
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="documentBackUrl"
            render={({ field }) => (
              <FormItem>
                <FileDropZone
                  label="Back Side"
                  hint="Upload if your document has a reverse side"
                  value={field.value}
                  base64Value={form.watch("documentBackBase64")}
                  onChange={field.onChange}
                  onBase64Change={(b64) =>
                    form.setValue("documentBackBase64", b64, { shouldValidate: true })
                  }
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="documentNumber"
            render={({ field }) => (
              <FormItem>
                <input
                  placeholder="Document number"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <input
                  type="date"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem>
                <input
                  type="date"
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-4">
          <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Important — Document Requirements
          </h4>
          <ul className="text-xs text-red-600 dark:text-red-500 space-y-1.5">
            <li>• Use the ORIGINAL physical document — no photocopies</li>
            <li>• Do NOT take a photo of a screen or monitor</li>
            <li>• Do NOT crop, edit, or apply filters to the image</li>
            <li>• All four corners of the document must be visible</li>
            <li>• Place document on a plain dark background</li>
            <li>• Ensure all text is sharply readable with no glare</li>
            <li>• Minimum resolution: 1000 x 600 pixels</li>
            <li>• Accepted formats: JPG, PNG — maximum 16MB</li>
          </ul>
        </div>

        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button type="submit" disabled={!selectedDocType} className="bg-violet-600 hover:bg-violet-700 text-white px-6">
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
