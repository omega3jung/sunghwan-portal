import { Settings2 } from "lucide-react";
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
import { ENVIRONMENT } from "@/lib/environment";

import { menuItems } from "./mock";

export function LeftMenu() {
  const { t } = useTranslation("LeftMenu");

  return (
    <Sidebar collapsible="icon" className="group">
      <SidebarHeader className="h-14 flex flex-row justify-between items-center p-2.5">
        <SidebarTrigger />
        <img
          className="h-full w-fit
          group-data-[state=collapsed]:transition-all group-data-[state=collapsed]:hidden
          "
          src={`${ENVIRONMENT.BASE_PATH}/images/logo_light.png`}
          alt={"logo"}
        />
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />
      <SidebarContent>
        {menuItems.content.map((item) => (
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
        {menuItems.footer.map((item) => (
          <SidebarMenuItem key={item.title}>
            <PreferencesMenu>
              <SidebarMenuButton asChild>
                <Link href={item.path}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </PreferencesMenu>
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
