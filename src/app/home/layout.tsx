import { LeftMenu } from "@/components/layout/LeftMenu";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider className="flex h-full">
      {/* Left Menu */}
      <LeftMenu></LeftMenu>

      {/* Right Main Screen */}
      <div className="grid grid-rows-[auto_1fr_auto] h-full w-full min-h-0">
        {/* Top Navigation */}
        <header className="h-14 flex items-center">
          <SidebarTrigger />
        </header>

        {/* Page Content */}
        <main className="overflow-auto p-4 min-h-0">{children}</main>

        <footer className="h-12 p-4 border-t text-sm text-muted-foreground">
          © 2025 SungHwan Jung.
          <a href="https://github.com/omega3jung/sunghwan-portal"></a>
        </footer>
      </div>
    </SidebarProvider>
  );
}
