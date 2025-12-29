import { Settings2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { PreferencesMenu } from "@/components/menu/PreferencesMenu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useImpersonation } from "@/hooks/useImpersonation";
import { ENVIRONMENT } from "@/lib/environment";

import { filterMenuByAccessLevel } from "./menu.utils";
import { createMenuItems } from "./mock";

export function LeftMenu() {
  const { effective } = useImpersonation();

  const { t } = useTranslation("LeftMenu");
  const menuItems = createMenuItems(t);

  const filteredMenu = {
    content: filterMenuByAccessLevel(menuItems.content, effective?.permission),
    footer: filterMenuByAccessLevel(menuItems.footer, effective?.permission),
  };

  return (
    <Sidebar collapsible="icon" className="group">
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
      <SidebarSeparator className="mx-0" />
      <SidebarContent>
        {filteredMenu.content.map((item) => (
          <SidebarGroup key={item.title}>
            {item.children ? (
              <>
                <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  {item.children.map((subItem) => (
                    <SidebarMenu key={subItem.title}>
                      <SidebarMenuItem key={subItem.title}>
                        <SidebarMenuButton asChild>
                          <Link href={subItem.path}>
                            <subItem.icon />
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  ))}
                </SidebarGroupContent>
              </>
            ) : (
              <SidebarGroupContent>
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        {filteredMenu.footer.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <Link href={item.path}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem key={"Preferences"}>
          <PreferencesMenu>
            <SidebarMenuButton>
              <Settings2 />
              {t("preferences")}
            </SidebarMenuButton>
          </PreferencesMenu>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
