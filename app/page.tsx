import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import Image from "next/image";

export default async function KYCHero() {
	const { userId } = await auth();
	const href = userId ? "/dashboard" : "/new-user";

	return (
		<section className="w-full overflow-x-hidden min-h-screen">
			<div className="h-full">
				<div className="grid lg:grid-cols-2 h-screen gap-8 items-stretch">
					{/* Left Column - Centered Content */}
					<div className="flex flex-col justify-center items-center lg:items-start py-12 px-4 lg:px-24 lg:py-24">
						<div className="max-w-xl text-center lg:text-left space-y-6">
							<h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
								KYC Reimagined: Performance, Intelligence, Convenience
							</h1>
							<p className="text-lg text-muted-foreground md:text-xl lg:pb-20">
								Streamline your Know Your Customer process with our cutting-edge solution that combines speed, smart technology, and ease of use.
							</p>
							<Button
								asChild
								className="rounded-lg bg-black px-8 py-6 text-lg font-medium text-white hover:bg-gray-900 transition-colors w-full"
							>
								<Link href={href}>
									{userId ? "Go to Dashboard" : "Get Started"}
								</Link>
							</Button>
						</div>
					</div>

					{/* Right Column - Full-height Image */}
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
			</div>
		</section>
	);
}