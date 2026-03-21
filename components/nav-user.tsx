"use client"

import Image from "next/image"
// import { Button } from "@/components/ui/button"
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  // user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const {isMobile} = useSidebar();
  
  return (
    <SidebarMenu>
      {!isMobile && (
      <SidebarMenuItem>
        <div className="rounded-lg bg-black p-4 relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Image
                src="/deeptrack-logo.png"
                width={128}
                height={28}
                alt="logo"
                className="h-auto w-auto"
              />
              {/* <div className="ml-1 flex space-x-[2px]">
                <div className="w-[3px] h-4 bg-foreground"></div>
                <div className="w-[3px] h-4 bg-foreground"></div>
                <div className="w-[3px] h-4 bg-foreground"></div>
              </div> */}
            </div>
            {/* <div className="bg-white rounded-full p-1.5">
              <div className="w-5 h-5 flex items-center justify-center">
                <span className="text-black text-lg">?</span>
              </div>
            </div> */}
          </div>
          {/* <h3 className="font-semibold mb-1">Need help?</h3>
          <p className="text-sm text-muted-foreground mb-3">Please check our docs</p> */}
          {/* <Button
            className="w-full bg-muted-foreground/10 hover:bg-muted-foreground/20 hover:text-white text-white"
            variant="ghost"
          >
            DOCUMENTATION
          </Button> */}
        </div>
      </SidebarMenuItem>
      )}
      {/* Additional content below */}
    </SidebarMenu>
  )
}
