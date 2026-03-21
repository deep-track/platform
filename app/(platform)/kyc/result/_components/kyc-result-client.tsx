"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { getKYCList } from "@/actions/kyc";

interface Props {
  reference: string;
}

export default function KYCResultClient({ reference }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<string>("processing");
  const [kycId, setKycId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (status === "approved" || status === "declined") return;

    const poll = async () => {
      const result = await getKYCList({ limit: 100 });
      if (result.success) {
        const record = result.data.records.find(
          (recordItem) => recordItem.reference === reference,
        );
        if (record) {
          setStatus(record.status);
          setKycId(record.id);
        }
      }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [reference, status]);

  return (
    <div className="max-w-md w-full text-center space-y-6">
      {status === "approved" && (
        <>
          <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Identity Verified!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Your identity has been successfully verified.
            </p>
          </div>
        </>
      )}

      {status === "declined" && (
        <>
          <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Verification Declined
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Please ensure your documents are clear and unedited, then try again.
            </p>
          </div>
        </>
      )}

      {(status === "processing" || status === "pending") && (
        <>
          <div className="h-20 w-20 rounded-full bg-violet-100 flex items-center justify-center mx-auto">
            <Loader2 className="h-10 w-10 text-violet-600 animate-spin" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Processing...
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Shufti Pro is verifying your documents.
            </p>
            <p className="text-xs text-slate-400 mt-1 tabular-nums">
              {elapsed}s elapsed · checking every 3s
            </p>
          </div>
        </>
      )}

      {status === "requires_review" && (
        <>
          <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Under Review
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Your submission is being manually reviewed. You will receive an email notification.
            </p>
          </div>
        </>
      )}

      <div className="flex gap-3 justify-center flex-wrap mt-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-lg bg-black hover:bg-black/80 text-white text-sm font-medium px-6 py-2.5 transition-colors"
        >
          Go to Dashboard
        </button>
        {kycId && (
          <button
            onClick={() => router.push(`/kyc/${kycId}`)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium px-6 py-2.5 transition-colors"
          >
            View Record
          </button>
        )}
      </div>
    </div>
  );
}
