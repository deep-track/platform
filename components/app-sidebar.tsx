"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { TypographyP, TypographySmall } from "@/components/ui/typography";
import {
	Database,
	Home,
	Key,
	Search,
	Settings,
	User2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import React from "react";
import { Toaster } from "react-hot-toast";


const getItems = (role: "user" | "admin") => {
	const baseItems = [
		{ title: "Home", url: "/dashboard", icon: Home },
		{ title: "Insights", url: "/insights", icon: Database },
		{ title: "API Keys", url: "/api-keys", icon: Key },
		{ title: "Settings", url: "#", icon: Settings },
		{ title: "Organization", url: "#", icon: User2 },
	];

	if (role === "admin") {
		// Insert Members link after Home for admin users
		baseItems.splice(1, 0, { title: "Members", url: "/members", icon: User2 });
	}

	return baseItems;
};

type Props = {
	role: "user" | "admin";
};

export function AppSidebar({ role }: Props) {
	const pathname = usePathname();
	const router = useRouter();

	// Protected routes that only admin can access
	const adminRoutes = ["/members"];

	// Check if current path is admin-only and redirect if user is not admin
	React.useEffect(() => {
		if (
			role !== "admin" &&
			adminRoutes.some((route) => pathname.startsWith(route))
		) {
			router.push("/dashboard");
		}
	}, [pathname, role, router]);

	return (
		<>
			<Toaster />
			<Sidebar>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>
							<Image
								src="/deeptrack-logo.png"
								alt="DeepTrack logo"
								width={120}
								height={120}
								className="px-2 py-2 mt-2"
								priority
							/>
						</SidebarGroupLabel>
					</SidebarGroup>
					<SidebarSeparator />
					<SidebarGroup>
						<SidebarMenu className="px-4">
							{getItems(role).map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton tooltip={item.title} asChild className="hover:bg-black/90">
										<Link
											href={item.url}
											className={`flex items-center gap-2 px-4 py-2 rounded-xl hover:text-white transition-colors ${
												pathname === item.url
													? "bg-black text-white"
													: ""
											}`}
										>
											<div className="p-2 rounded-xl bg-primary text-primary-foreground">
												<item.icon className="w-5 h-5" />
											</div>
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroup>
				</SidebarContent>

				<SidebarFooter>
					<Card className="m-4 p-4 bg-black text-white border-none">
						<Image
							src="/deeptrack-logo.png"
							alt="DeepTrack logo"
							width={120}
							height={80}
							className="mb-2"
							priority
						/>
						<TypographyP className="font-bold">Need help?</TypographyP>
						<TypographySmall>Please check our docs</TypographySmall>
						<Button asChild variant="secondary" className="w-full mt-2 text-black hover:bg-customTeal/90">
							<a
								href="https://docs.deeptrack.io"
								target="_blank"
								rel="noopener noreferrer"
							>
								DOCUMENTATION
							</a>
						</Button>
					</Card>
				</SidebarFooter>
			</Sidebar>
		</>
	);
}