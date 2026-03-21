"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { type SelfieData } from "@/lib/kyc-types";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  RefreshCw,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { uploadFiles } from "@/lib/uploadthing";

interface SelfieStepProps {
  defaultValues?: Partial<SelfieData>;
  onNext: (data: SelfieData) => void;
  onBack: () => void;
}

type Mode = "choose" | "camera" | "upload" | "preview";

export function SelfieStep({ defaultValues, onNext, onBack }: SelfieStepProps) {
  const [mode, setMode] = useState<Mode>(defaultValues?.selfieUrl ? "preview" : "choose");
  const [selfieUrl, setSelfieUrl] = useState<string>(defaultValues?.selfieUrl ?? "");
  const [selfieBase64, setSelfieBase64] = useState<string>(defaultValues?.selfieBase64 ?? "");
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setError(null);

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError("Camera is not supported in this browser or context. Please upload a file instead.");
      return;
    }

    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      stopCamera();
      setCameraError(
        "Camera access denied. Please allow camera access in your browser settings or use file upload instead.",
      );
    }
  }, [stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);

    stopCamera();
    setMode("upload");

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError("Failed to capture photo. Please try again.");
        setMode("camera");
        return;
      }
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        setSelfieBase64(base64);

        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        const uploaded = await uploadFiles("kycUploader", { files: [file] });
        if (!uploaded || uploaded.length === 0) throw new Error("Upload failed");
        setSelfieUrl(uploaded[0].url);
        setMode("preview");
      } catch {
        setError("Upload failed. Please retake your photo.");
        setMode("choose");
      }
    }, "image/jpeg", 0.92);
  }, [stopCamera]);

  async function handleFileUpload(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image must be under 8MB.");
      return;
    }
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setSelfieBase64(base64);

      const uploaded = await uploadFiles("kycUploader", { files: [file] });
      if (!uploaded || uploaded.length === 0) throw new Error("Upload failed");
      setSelfieUrl(uploaded[0].url);
      setMode("preview");
    } catch {
      setError("Upload failed. Please try again.");
    }
  }

  function reset() {
    stopCamera();
    setSelfieUrl("");
    setSelfieBase64("");
    setError(null);
    setCameraError(null);
    setMode("choose");
  }

  function handleNext() {
    if (!selfieUrl) {
      setError("Please provide a selfie to continue.");
      return;
    }
    onNext({ selfieUrl, selfieBase64 });
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Selfie Photo</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Take or upload a clear photo of your face. After submitting, you will be
          redirected to a short live verification session powered by Shufti Pro.
        </p>
      </div>

      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-4 max-w-lg">
        <div className="flex items-start gap-3">
          <div className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Live verification follows
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
              After you submit, Shufti Pro will open a short liveness session
              in this window. Keep your camera ready and follow the on-screen
              instructions.
            </p>
          </div>
        </div>
      </div>

      {mode === "choose" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <button
            type="button"
            onClick={() => {
              setMode("camera");
              startCamera();
            }}
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-violet-400 hover:bg-violet-50/50 dark:border-slate-700 dark:hover:border-violet-600 dark:hover:bg-violet-900/10 p-8 transition-all"
          >
            <div className="h-12 w-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Camera className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="text-center">
              <p className="font-medium text-slate-700 dark:text-slate-300 text-sm">Use Camera</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Take photo now</p>
            </div>
          </button>

          <label className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-violet-400 hover:bg-violet-50/50 dark:border-slate-700 dark:hover:border-violet-600 dark:hover:bg-violet-900/10 p-8 transition-all cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setMode("upload");
                  handleFileUpload(file);
                }
              }}
            />
            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <Upload className="h-6 w-6 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="text-center">
              <p className="font-medium text-slate-700 dark:text-slate-300 text-sm">Upload Photo</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">JPG, PNG, WEBP</p>
            </div>
          </label>
        </div>
      )}

      {mode === "camera" && (
        <div className="space-y-4 max-w-md">
          {cameraError ? (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-400">Camera unavailable</p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-1">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setMode("choose");
                    setCameraError(null);
                  }}
                  className="text-xs text-violet-600 dark:text-violet-400 underline mt-2"
                >
                  Try file upload instead
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => setCameraActive(true)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-56 rounded-full border-2 border-dashed border-white/40" />
                </div>
                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                    <div className="h-8 w-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    stopCamera();
                    setMode("choose");
                  }}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button type="button" disabled={!cameraActive} onClick={capturePhoto} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white">
                  <Camera className="mr-2 h-4 w-4" /> Capture
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {mode === "preview" && selfieUrl && (
        <div className="space-y-4 max-w-sm">
          <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-[3/4] border border-slate-200 dark:border-slate-700">
            <Image src={selfieUrl} alt="Selfie preview" fill className="object-cover" />
            <div className="absolute top-3 right-3">
              <div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={reset} className="w-full">
            <RefreshCw className="mr-2 h-3.5 w-3.5" /> Retake / Replace
          </Button>
        </div>
      )}

      <div className="rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4 max-w-lg">
        <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">Selfie Requirements</h4>
        <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
          <li>• Your full face must be clearly visible and centered</li>
          <li>• No sunglasses, heavy filters, or face coverings</li>
          <li>• Good lighting — avoid backlighting or shadows on face</li>
          <li>• Neutral expression, eyes open and looking at camera</li>
          <li>• Photo must be taken within the past 6 months</li>
        </ul>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="button" onClick={handleNext} disabled={!selfieUrl} className="bg-violet-600 hover:bg-violet-700 text-white px-6">
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
