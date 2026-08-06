import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { TeamSwitcher } from "../Other/team-switcher"
import CreateChannel from "../Channel/CreateChannel"

export function AppSidebar(props) {
  return (
    <Sidebar {...props} >
      <SidebarHeader className="px-2.5">
        <div className="flex items-center gap-1 mb-1">
          <img src="/logo.svg" width={50} height={50} />
          <h2 className="text-2xl">Chatti</h2>
        </div>
      <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent className="px-2.5 mt-1">
        <CreateChannel />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}