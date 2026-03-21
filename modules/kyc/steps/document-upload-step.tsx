"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentUploadSchema, type DocumentUploadData } from "@/lib/kyc-types";
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
import { ArrowLeft, ArrowRight, Upload, X, FileCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadFiles } from "@/lib/uploadthing";
import Image from "next/image";

interface DocumentUploadStepProps {
  defaultValues?: Partial<DocumentUploadData>;
  onNext: (data: DocumentUploadData) => void;
  onBack: () => void;
}

const DOCUMENT_TYPES = [
  { value: "passport", label: "Passport", hint: "Photo page of your passport" },
  { value: "id_card", label: "National ID Card", hint: "Front and back required" },
  { value: "driving_license", label: "Driver's License", hint: "Front and back required" },
] as const;

type DocType = "passport" | "id_card" | "driving_license";

async function uploadToUploadthing(file: File): Promise<string> {
  const res = await uploadFiles("kycUploader", { files: [file] });
  if (!res || res.length === 0) throw new Error("Upload failed");
  return res[0].url;
}

function FileDropZone({
  label,
  hint,
  value,
  onChange,
  required,
}: {
  label: string;
  hint?: string;
  value?: string;
  onChange: (url: string) => void;
  required?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError("Please upload an image (JPG, PNG) or PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const uploadedUrl = await uploadToUploadthing(file);

      onChange(uploadedUrl);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  const isPdf = value?.toLowerCase().includes(".pdf") || 
                value?.toLowerCase().includes("application/pdf") ||
                (value && !value.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i) && 
                 value.startsWith("https://"));

  const isImage = !isPdf && !!value;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>
      {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}

      {value ? (
        <div className="relative rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10 p-3">
          <div className="flex items-center gap-3">
            <div className="h-16 w-24 rounded overflow-hidden border border-slate-200 flex-shrink-0 relative">
              {isImage ? (
                <Image src={value} alt={label} fill className="object-cover" />
              ) : (
                <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                  <FileCheck className="h-8 w-8 text-slate-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <FileCheck className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium">File uploaded</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Click × to replace</p>
            </div>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <label
          className={cn(
            "relative flex flex-col items-center justify-center w-full h-36 rounded-lg border-2 border-dashed cursor-pointer transition-all",
            "border-slate-200 bg-slate-50 hover:border-violet-400 hover:bg-violet-50/50",
            "dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-violet-600 dark:hover:bg-violet-900/10",
            uploading && "opacity-60 cursor-wait",
          )}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
              <p className="text-sm text-slate-500">Processing…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <Upload className="h-8 w-8 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Drop file here or <span className="text-violet-600 dark:text-violet-400">browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">JPG, PNG or PDF · Max 10MB</p>
              </div>
            </div>
          )}
        </label>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-red-600 text-xs">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
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
      documentBackUrl: "",
      documentNumber: "",
      expiryDate: "",
      issueDate: "",
      ...defaultValues,
    },
  });

  const selectedDocType = form.watch("documentType") as DocType | undefined;
  const requiresBack = selectedDocType === "id_card" || selectedDocType === "driving_license";

  const selectedDocConfig = DOCUMENT_TYPES.find((d) => d.value === selectedDocType);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-8">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">Document Type</h3>
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

        {selectedDocType && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
              Upload {selectedDocConfig?.label}
            </h3>
            <div className={cn("grid gap-4", requiresBack ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 max-w-sm")}>
              <FormField
                control={form.control}
                name="documentFrontUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FileDropZone
                        label={requiresBack ? "Front Side" : "Document Photo Page"}
                        hint={requiresBack ? "Clear photo of the front side" : "The page with your photo and personal details"}
                        value={field.value}
                        onChange={field.onChange}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {requiresBack && (
                <FormField
                  control={form.control}
                  name="documentBackUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileDropZone
                          label="Back Side"
                          hint="Clear photo of the back side"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        )}

        {selectedDocType && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
              Document Details <span className="text-slate-400 font-normal normal-case">(optional but recommended)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="documentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. P123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-4">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Photo Guidelines</h4>
          <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
            <li>• Ensure all corners of the document are visible</li>
            <li>• Take photo in good lighting — no shadows or glare</li>
            <li>• All text must be clearly readable</li>
            <li>• Do not edit, crop, or filter the image</li>
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
