import { ChevronRight, Link } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useImpersonation } from "@/feature/auth/impersonation/client";
import { createMenuMock } from "@/mocks/ui/navigation/leftMenu";

import { filterMenuByAccessLevel } from "./menu.utils";

export function LeftMenu() {
  const { currentUser } = useImpersonation();

  const { t } = useTranslation("LeftMenu");
  const menuItems = createMenuMock(t);

  const filteredMenu = {
    content: filterMenuByAccessLevel(
      menuItems.content,
      currentUser?.permission,
    ),
    footer: filterMenuByAccessLevel(menuItems.footer, currentUser?.permission),
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Portfolio Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenu.content.map((item) =>
                item.children ? (
                  <Collapsible className="group/collapsible" key={item.title}>
                    <SidebarMenuItem key={item.title}>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuButton asChild className="ml-2">
                                <Link href={subItem.path}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                      <SidebarMenuBadge>
                        <ChevronRight className="h-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuBadge>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.path}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
