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
import { menuItems } from "./mock";
import { Settings2 } from "lucide-react";
import { PreferencesMenu } from "@/components/menu/PreferencesMenu";
import { ENVIRONMENT } from "@/lib/environment";

export function LeftMenu() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b-[1px]">
        <img
          className="h-[39px] w-fit"
          src={`${ENVIRONMENT.BASE_PATH}/images/logo_light.png`}
          alt={"logo"}
        />
      </SidebarHeader>
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
              </>
            ) : (
              <SidebarGroupContent>
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
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
              <SidebarMenuButton>
                <item.icon />
                <a href={item.path}>
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </PreferencesMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem key={"Preferences"}>
          <PreferencesMenu>
            <SidebarMenuButton>
              <Settings2 />
              <span>{"Preferences"}</span>
            </SidebarMenuButton>
          </PreferencesMenu>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
