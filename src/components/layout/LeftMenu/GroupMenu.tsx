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
import { groupMenuItems } from "./mock";

export function LeftMenu() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader />
      <SidebarContent>
        {groupMenuItems.map((item) =>
          item.children ? (
            <SidebarGroup>
              <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                {item.children.map((subItem) => (
                  <SidebarMenu>
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
      <SidebarFooter />
    </Sidebar>
  );
}
