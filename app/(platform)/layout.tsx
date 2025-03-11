import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";


export default async function Layout({
	children,
}: { children: React.ReactNode }) {
	const user = await currentUser();
	if (!user) redirect("/sign-in");
	return (
		<SidebarProvider>
			<AppSidebar
				role={user?.publicMetadata.role as "user" | "admin" | "head"}
			/>
			<main className="w-full">
				<div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border h-11">
					<div className="flex items-center justify-between mx-8 mt-4">
						<SidebarTrigger />
						<UserButton signInUrl="/login" />
					</div>
				</div>

				{children}
			</main>
		</SidebarProvider>
	);
}
