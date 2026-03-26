"use client";

import { CheckCircle, X } from "lucide-react";
import { Card } from "@/components/ui/card";

export const DOCUMENT_TIPS = {
  do: [
    "Ensure the document is well-lit and clearly visible",
    "Include all four corners of the document in the frame",
    "Hold the camera steady or use a stand",
    "Use a dark background for contrast",
    "Take the photo in a well-lit area without glare",
  ],
  dont: [
    "Do not use a photocopy or digital screenshot",
    "Do not cover any part of the document",
    "Do not use filters or apply edits to the image",
    "Do not photograph a damaged or expired document",
    "Do not include other objects in the frame",
  ],
};

export const SELFIE_TIPS = {
  do: [
    "Look directly at the camera with a neutral expression",
    "Ensure good, even lighting on your face",
    "Keep your head straight, not tilted",
    "Remove sunglasses, hats, or face coverings",
    "Use a plain, simple background",
  ],
  dont: [
    "Do not use filters, effects, or heavy makeup",
    "Do not submit a blurry or out-of-focus image",
    "Do not include other people in the photo",
    "Do not have shadows or poor lighting",
    "Do not use a very old photo that doesn't match current appearance",
  ],
};

interface VerificationTipsProps {
  type: "document" | "selfie";
}

export function VerificationTips({ type }: VerificationTipsProps) {
  const tips = type === "document" ? DOCUMENT_TIPS : SELFIE_TIPS;
  const title = type === "document" ? "Document Capture Tips" : "Selfie Tips";

  return (
    <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-6 mb-6">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
        {title}
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Do's Column */}
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-400 text-sm">
            <CheckCircle className="h-4 w-4" />
            Do This
          </h4>
          <ul className="space-y-2">
            {tips.do.map((tip, idx) => (
              <li
                key={idx}
                className="flex gap-2 text-sm text-slate-600 dark:text-slate-300"
              >
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Don't's Column */}
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-medium text-red-700 dark:text-red-400 text-sm">
            <X className="h-4 w-4" />
            Avoid This
          </h4>
          <ul className="space-y-2">
            {tips.dont.map((tip, idx) => (
              <li
                key={idx}
                className="flex gap-2 text-sm text-slate-600 dark:text-slate-300"
              >
                <span className="text-red-600 dark:text-red-400 font-bold">
                  ✕
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
