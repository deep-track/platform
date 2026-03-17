import LogoLink from "@/components/logo-link";
import { Button } from "@/components/ui/button";
import { TypographyH1, TypographyP } from "@/components/ui/typography";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
	metadataBase: new URL(process.env.NEXT_PUBLIC_URL as string),
	title: "Sign In",
	description: "Sign in to your account",
};

export default function SignInPage() {
	return (
		<div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
			<div className="h-full flex flex-col items-center justify-center px-4 relative">
				<div className="absolute left-2 top-2 md:top-3 md:left-5">
					<LogoLink />
				</div>
				<div className="text-center space-y-4 pt-4">
					<TypographyH1>Welcome Back!</TypographyH1>
					<TypographyP>Log in or create account!</TypographyP>
				</div>
				<div className="flex items-center justify-center mt-8">
					<Button asChild className="rounded-lg bg-black px-8 py-6 text-base">
						<Link href="/auth/login">Continue with Auth0</Link>
					</Button>
				</div>
			</div>
			<div className="hidden lg:block relative min-h-[90vh] lg:min-h-[auto]">
				<div className="absolute inset-0 h-full w-full">
					<Image
						src="/dashboard-hero.png"
						alt="Professional using KYC solution"
						fill
						className="object-cover object-center"
						priority
						sizes="(max-width: 1440px) 100vw, 50vw"
					/>
				</div>
			</div>
		</div>
	);
}