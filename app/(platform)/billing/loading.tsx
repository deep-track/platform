import { TypographyMuted } from "@/components/ui/typography";
import { Loader2 } from "lucide-react";
import React from "react";

export default function Loading() {
	return (
		<div className="h-screen flex items-center justify-center">
			<div className="flex items-center gap-6 flex-col">
				<Loader2 className="size-16 animate-spin text-muted-foreground" />
				<TypographyMuted className="animate-bounce">Loading...</TypographyMuted>
			</div>
		</div>
	);
}
