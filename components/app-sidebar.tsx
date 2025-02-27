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
} from "@/components/ui/sidebar";
import { TypographyP, TypographySmall } from "@/components/ui/typography";
import {
	Book,
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

const externalItems = [
	{
		title: "Docs",
		url: "https://deeptrack.ai/docs",
		icon: Book,
	},
];

const getItems = (role: "user" | "admin") => {
	const baseItems = [
		{ title: "Home", url: "/dashboard", icon: Home },
		{ title: "Insights", url: "/insights", icon: Database },
		{ title: "Verifications", url: "#", icon: Search },
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
						<SidebarGroupLabel className="px-4 py-2">
							<Image
								src="/deeptrack-logo.png"
								alt="DeepTrack logo"
								width={120}
								height={120}
								className=""
							/>
						</SidebarGroupLabel>
					</SidebarGroup>

					<SidebarGroup>
						<SidebarGroupLabel className="px-4 py-2">
							<TypographySmall>Overview</TypographySmall>
						</SidebarGroupLabel>
						<SidebarMenu className="px-4">
							{getItems(role).map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton tooltip={item.title} asChild>
										<Link
											href={item.url}
											className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors ${
												pathname === item.url
													? "bg-accent text-accent-foreground"
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
					<Card className="m-4 p-4">
						<Image
							src="/deeptrack-logo.png"
							alt="DeepTrack logo"
							width={80}
							height={80}
							className="mb-2"
						/>
						<TypographyP className="font-bold">Need help?</TypographyP>
						<TypographyP>Please check our docs</TypographyP>
						<Button asChild variant="outline" className="w-full mt-2">
							<a
								href="https://deeptrack.ai/docs"
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