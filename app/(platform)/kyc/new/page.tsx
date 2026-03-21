import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { KYCWizard } from "@/modules/kyc/kyc-wizard";

interface NewKYCPageProps {
  searchParams: Promise<{ token?: string; email?: string }>;
}

export default async function NewKYCPage({ searchParams }: NewKYCPageProps) {
  const params = await searchParams;
  const invitationToken = params.token;
  const prefillEmail = params.email;

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/kyc"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-8 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to KYC
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Identity Verification</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm max-w-xl">
            Complete the steps below to verify your identity. Your data is secured and processed through Shufti Pro.
          </p>

          {invitationToken && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 px-3 py-2 text-sm text-violet-700 dark:text-violet-300">
              <span className="text-xs">🔗 You were invited to complete this verification</span>
            </div>
          )}
        </div>

        <KYCWizard invitationToken={invitationToken} prefillEmail={prefillEmail} />
      </div>
    </div>
  );
}
