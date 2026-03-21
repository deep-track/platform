"use client"

import * as React from "react"
import {
  Book,
  CreditCard,
  Home,
  LucideLogOut,
  Settings2,
  User2,
  Wrench,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import Image from "next/image"
// import { Button } from "./ui/button"
import toast, { Toaster } from "react-hot-toast"
import { useState } from "react"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Docs",
      url: "https://deeptrack.ai/docs",
      icon: Book,
    },
    {
      title: "Insights",
      url: "/insights",
      icon: Settings2 ,
    },
    {
      title: "Billing",
      url: "#",
      icon: CreditCard,
    },
    {
      title: "Settings",
      url: "#",
      icon:Wrench,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const handleSignOut = () => {
    // Use full page redirect to Auth0 logout endpoint
    // This is required by Auth0 SDK and avoids CORS issues
    window.location.href = '/api/auth/logout'
  }

  const projects = [
    {
      name: "Profile",
      url: "#",
      icon: User2,
    },
    {
      name: "Sign Out",
      icon: LucideLogOut,
      onClick: handleSignOut,
    },
  ]

  return (
    <>
    <Toaster />
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b">
        <Image 
          src='/deeptrack-logo.png'
          alt='DeepTrack logo'
          width={120}
          height={120}
          className="mt-2 p-2 border-b-slate-600"
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    </>
  )
}
