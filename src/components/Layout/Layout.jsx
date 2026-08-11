import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { cn } from "@/lib/utils"

export default function Layout({
  children,
  headerTitle,
  headerNavigation,
  contentClassName,
}) {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset className="h-svh min-h-0 overflow-hidden md:h-[calc(100svh-1rem)]">
        <header className="shrink-0 border-b">
          <div className="flex h-14 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            {headerTitle}
          </div>
          {headerNavigation && (
            <div className="overflow-x-auto px-4">
              {headerNavigation}
            </div>
          )}
        </header>
        <div className={cn("min-h-0 flex-1 p-4", contentClassName)}>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
