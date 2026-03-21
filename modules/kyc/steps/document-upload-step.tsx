"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentUploadSchema, type DocumentUploadData } from "@/lib/kyc-types";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function DocumentUploadStep({ defaultValues, onNext, onBack }: DocumentUploadStepProps) {
  const form = useForm<DocumentUploadData>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      documentType: undefined,
      documentFrontUrl: "hosted_capture",
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
        onSubmit={form.handleSubmit((values) =>
          onNext({
            ...values,
            documentFrontUrl: values.documentFrontUrl || "hosted_capture",
            documentBackUrl: "",
            documentFrontBase64: "",
            documentBackBase64: "",
          }),
        )}
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

        <div className="rounded-lg bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800 p-4">
          <p className="text-xs text-violet-700 dark:text-violet-300">
            Documents and selfie will be captured securely on Shufti Pro in the next step.
          </p>
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
