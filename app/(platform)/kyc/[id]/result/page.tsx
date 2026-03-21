import Link from "next/link";
import { CheckCircle, Clock } from "lucide-react";

interface ResultPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ event?: string }>;
}

export default async function KYCResultPage({
  params,
  searchParams,
}: ResultPageProps) {
  const { id } = await params;
  const { event } = await searchParams;

  const accepted =
    event === "verification.accepted" || event === "review.accepted";
  const declined =
    event === "verification.declined" || event === "review.declined";

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {accepted ? (
          <>
            <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Liveness Verified!
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                Your identity verification is complete. You will receive a
                confirmation email shortly.
              </p>
            </div>
          </>
        ) : declined ? (
          <>
            <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
              <span className="text-4xl">✗</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Verification Declined
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                We could not verify your identity at this time. Please
                contact support or try again.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
              <Clock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Verification In Progress
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                Your liveness check was received and is being processed.
                This usually takes a few minutes.
              </p>
            </div>
          </>
        )}

        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/dashboard"
            className="rounded-lg bg-black hover:bg-black/80 text-white text-sm font-medium px-6 py-2.5 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href={`/kyc/${id}`}
            className="rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium px-6 py-2.5 transition-colors"
          >
            View Record
          </Link>
        </div>
      </div>
    </div>
  );
}
