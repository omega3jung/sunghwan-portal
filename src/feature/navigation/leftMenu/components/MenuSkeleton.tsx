import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ENVIRONMENT } from "@/lib/config/environment";

export function LeftMenuSkeleton() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 flex flex-row justify-between items-center p-2.5">
        <SidebarTrigger />
        <Image
          src={`${ENVIRONMENT.BASE_PATH}/images/logo_light.png`}
          alt="Portal Logo"
          className="block dark:hidden
          group-data-[state=collapsed]:transition-all group-data-[state=collapsed]:hidden"
          width={120}
          height={32}
          priority
        />
        <Image
          src={`${ENVIRONMENT.BASE_PATH}/images/logo_dark.png`}
          alt="Portal Logo"
          className="hidden dark:block
          group-data-[state=collapsed]:transition-all group-data-[state=collapsed]:hidden"
          width={120}
          height={32}
          priority
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {Array.from({ length: 5 }).map((_, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuSkeleton />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {Array.from({ length: 2 }).map((_, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuSkeleton />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
