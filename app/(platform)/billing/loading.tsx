import { TypographyMuted } from "@/components/ui/typography";
import { Loader } from "lucide-react";
import React from "react";

export default function Loading() {
	return (
		<div className="h-screen flex items-center justify-center">
			<div className="flex items-center gap-6 flex-col">
				<Loader className="size-32 animate-spin" />
				<TypographyMuted className="animate-bounce text-lg text-muted-foreground">
					Loading...
				</TypographyMuted>
			</div>
		</div>
	);
}
