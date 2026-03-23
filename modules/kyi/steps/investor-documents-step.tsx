"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle,
  FileText,
  Loader2,
  RefreshCw,
  Upload,
} from "lucide-react";
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
  base64Value,
  required,
  uploading,
  accept,
  onUpload,
}: {
  label: string;
  hint: string;
  value?: string;
  base64Value?: string;
  required?: boolean;
  uploading: boolean;
  accept?: string;
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
          accept={accept ?? "image/*,.pdf"}
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
        <div className="inline-flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="h-3.5 w-3.5" />
          Uploaded successfully{base64Value ? " • image data captured" : ""}
        </div>
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
  const [selfieMode, setSelfieMode] = useState<"choose" | "camera" | "upload" | "preview">(
    defaultValues?.selfieUrl ? "preview" : "choose",
  );
  const [selfieError, setSelfieError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const form = useForm<InvestorDocumentsData>({
    resolver: zodResolver(investorDocumentsSchema),
    defaultValues: {
      governmentIdUrl: "",
      governmentIdBase64: "",
      governmentIdType: "passport",
      selfieUrl: "",
      selfieBase64: "",
      bankStatementUrl: "",
      proofOfAddressUrl: "",
      proofOfNetWorthUrl: "",
      accreditationLetterUrl: "",
      sourceOfFundsDocUrl: "",
      corporateDocUrl: "",
      ...defaultValues,
    },
  });

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setSelfieError(null);
    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError("Camera is not supported in this browser. Upload an image instead.");
      return;
    }

    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      stopCamera();
      setCameraError("Camera access denied. Please allow camera access or upload an image.");
    }
  }, [stopCamera]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  async function uploadToField(
    field: keyof InvestorDocumentsData,
    file: File,
    base64Field?: keyof InvestorDocumentsData,
  ) {
    try {
      setUploadingField(field);
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
      if (!url) throw new Error("Upload failed");

      form.setValue(field, url, { shouldValidate: true });
      if (base64Field) {
        form.setValue(base64Field, base64Result, { shouldValidate: true });
      }
    } catch {
      form.setError(field, { type: "manual", message: "Upload failed. Try again." });
    } finally {
      setUploadingField(null);
    }
  }

  const captureSelfie = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    stopCamera();
    setSelfieMode("upload");

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setSelfieError("Failed to capture. Please try again.");
        setSelfieMode("choose");
        return;
      }

      try {
        const file = new File([blob], "kyi-selfie.jpg", { type: "image/jpeg" });
        const [base64Result, uploadResult] = await Promise.all([
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          }),
          uploadFiles("kycUploader", { files: [file] }),
        ]);

        const url = uploadResult[0]?.ufsUrl ?? uploadResult[0]?.url;
        if (!url) throw new Error("No URL returned");

        form.setValue("selfieUrl", url, { shouldValidate: true });
        form.setValue("selfieBase64", base64Result, { shouldValidate: true });
        setSelfieMode("preview");
      } catch {
        setSelfieError("Upload failed. Please retake your photo.");
        setSelfieMode("choose");
      }
    }, "image/jpeg", 0.95);
  }, [form, stopCamera]);

  async function handleSelfieFileUpload(file: File) {
    setSelfieError(null);
    if (!file.type.startsWith("image/")) {
      setSelfieError("Please upload an image file.");
      return;
    }
    if (file.size > 16 * 1024 * 1024) {
      setSelfieError("Image must be under 16MB.");
      return;
    }

    try {
      setSelfieMode("upload");
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
      if (!url) throw new Error("No URL returned");

      form.setValue("selfieUrl", url, { shouldValidate: true });
      form.setValue("selfieBase64", base64Result, { shouldValidate: true });
      setSelfieMode("preview");
    } catch {
      setSelfieError("Upload failed. Please try again.");
      setSelfieMode("choose");
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
                    base64Value={form.watch("governmentIdBase64")}
                    required
                    uploading={uploadingField === "governmentIdUrl"}
                    onUpload={(file) => uploadToField("governmentIdUrl", file, "governmentIdBase64")}
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
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Selfie Verification</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">A clear photo of your face for identity matching</p>

          {selfieMode === "choose" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <button
                type="button"
                onClick={() => {
                  setSelfieMode("camera");
                  startCamera();
                }}
                className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-violet-400 dark:border-slate-700 p-6 transition-all"
              >
                <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <Camera className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Use Camera</p>
              </button>

              <label className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-violet-400 dark:border-slate-700 p-6 transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleSelfieFileUpload(file);
                  }}
                />
                <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-slate-500" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload Image</p>
              </label>
            </div>
          )}

          {selfieMode === "camera" && (
            <div className="space-y-3 max-w-md">
              {cameraError && <p className="text-xs text-red-600 dark:text-red-400">{cameraError}</p>}
              <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-black">
                <video ref={videoRef} className="w-full h-auto" playsInline muted />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2">
                <Button type="button" onClick={() => void captureSelfie()} disabled={!cameraActive} className="bg-violet-600 hover:bg-violet-700 text-white">
                  <Camera className="mr-2 h-4 w-4" /> Capture
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    stopCamera();
                    setSelfieMode("choose");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {selfieMode === "upload" && (
            <div className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin" /> Processing selfie...
            </div>
          )}

          {selfieMode === "preview" && (
            <div className="space-y-3 max-w-md">
              <div className="h-52 w-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative bg-slate-100 dark:bg-slate-800">
                {form.watch("selfieUrl") && (
                  <Image src={form.watch("selfieUrl")} alt="Selfie preview" fill className="object-cover" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-3.5 w-3.5" /> Selfie captured and image data prepared
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.setValue("selfieUrl", "", { shouldValidate: true });
                  form.setValue("selfieBase64", "", { shouldValidate: true });
                  setSelfieMode("choose");
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Retake / Reupload
              </Button>
            </div>
          )}

          {selfieError && <p className="text-xs text-red-600 dark:text-red-400">{selfieError}</p>}
          {form.formState.errors.selfieUrl && (
            <p className="text-xs text-red-600 dark:text-red-400">{form.formState.errors.selfieUrl.message}</p>
          )}
          {form.formState.errors.selfieBase64 && (
            <p className="text-xs text-red-600 dark:text-red-400">{form.formState.errors.selfieBase64.message}</p>
          )}
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
