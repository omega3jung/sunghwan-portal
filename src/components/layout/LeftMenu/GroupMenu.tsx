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
import { menuItems } from "./mock";
import { Settings2 } from "lucide-react";
import { PreferencesMenu } from "@/components/menu/PreferencesMenu";
import { ENVIRONMENT } from "@/lib/environment";

export function LeftMenu() {
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
