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
} from "@/components/ui/sidebar";
import { groupMenuItems } from "./mock";
import { Settings } from "lucide-react";
import { PreferencesMenu } from "@/components/menu/PreferencesMenu";

export function LeftMenu() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader />
      <SidebarContent>
        {groupMenuItems.map((item) =>
          item.children ? (
            <SidebarGroup key={item.title}>
              <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                {item.children.map((subItem) => (
                  <SidebarMenu key={subItem.title}>
                    <SidebarMenuItem key={subItem.title}>
                      <SidebarMenuButton>
                        <subItem.icon />
                        <a href={subItem.path}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuItem key={"Preferences"}>
          <PreferencesMenu
            trigger={
              <SidebarMenuButton asChild>
                <Settings />
                <span>{"Preferences"}</span>
              </SidebarMenuButton>
            }
          ></PreferencesMenu>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
