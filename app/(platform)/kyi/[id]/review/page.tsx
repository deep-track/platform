import { notFound } from "next/navigation";
import Link from "next/link";
import { getKYIRecord } from "@/actions/kyi";
import { KYIReviewClient } from "@/app/(platform)/kyi/[id]/review/_components/kyi-review-client";
import { ChevronLeft } from "lucide-react";

interface KYIReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function KYIReviewPage({ params }: KYIReviewPageProps) {
  const { id } = await params;
  const result = await getKYIRecord(id);

  if (!result.success || !result.data) notFound();

  const record = result.data;

  const reviewableStatuses = ["processing", "requires_review", "submitted"];
  if (!reviewableStatuses.includes(record.status)) {
    return (
      <div className="min-h-full bg-slate-50 dark:bg-slate-950 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href={`/kyi/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 mb-8"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Record
          </Link>
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 p-8 text-center">
            <p className="text-amber-700 dark:text-amber-400 font-medium">
              This KYI record cannot be reviewed in its current state (<strong>{record.status}</strong>).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/kyi/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-8 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Record
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Review Verification</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Make a final decision on this KYI submission.
          </p>
        </div>

        <KYIReviewClient record={record} />
      </div>
    </div>
  );
}
