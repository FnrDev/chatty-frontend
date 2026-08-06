import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { TeamSwitcher } from "../Other/team-switcher"

export function AppSidebar(props) {
  return (
    <Sidebar {...props} >
      <SidebarHeader className="px-2.5">
        <div className="flex items-center gap-1">
          <img src="/logo.svg" width={50} height={50} />
          <h2 className="text-2xl">Chatti</h2>
        </div>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}