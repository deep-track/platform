"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error(error);
	}, [error]);

	return (
		// biome-ignore lint/a11y/useValidLang: <explanation>
		<html lang="en-Us">
			<body>
				<div className="min-h-screen flex flex-col items-center justify-center bg-muted/50 p-4 md:p-6 lg:p-8">
					<div className="flex flex-col items-center space-y-4 text-center">
						<Image
							src="/error.webp"
							alt="Error illustration"
							width={300}
							height={300}
							priority
							className="rounded-lg mb-4"
						/>
						<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
							Oops! Something went wrong
						</h1>
						<p className="max-w-[600px] text-muted-foreground md:text-xl">
							We apologize for the inconvenience. An unexpected error occurred
							while processing your request.
						</p>
						<div className="flex gap-4">
							<Button onClick={reset} variant="default" size="lg">
								Try Again
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link href="/dashboard">Go Home</Link>
							</Button>
						</div>
						{error.digest && (
							<p className="text-sm text-muted-foreground">
								Error ID: {error.digest}
							</p>
						)}
					</div>
				</div>
			</body>
		</html>
	);
}
