import { Suspense } from "react";
import { redirect } from "next/navigation";
import KYCResultClient from "./_components/kyc-result-client";

interface ResultPageProps {
  searchParams: Promise<{ reference?: string }>;
}

export default async function KYCResultPage({
  searchParams,
}: ResultPageProps) {
  const { reference } = await searchParams;
  if (!reference) redirect("/kyc");

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-16 px-4">
      <Suspense
        fallback={
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 mt-3 text-sm">Loading result...</p>
          </div>
        }
      >
        <KYCResultClient reference={reference} />
      </Suspense>
    </div>
  );
}
