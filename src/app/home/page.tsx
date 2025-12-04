// src/app/home

import { LeftMenu } from "@/components/LeftMenu";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarProvider>
      <LeftMenu></LeftMenu>
      <main>
        <SidebarTrigger />
        <div>This portal is the portfolio of Sunghwan Jung for demo.</div>
      </main>
    </SidebarProvider>
  );
}
