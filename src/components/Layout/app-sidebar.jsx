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
      <SidebarFooter>
        <div className="bg-popover rounded-md flex items-center gap-3 p-3">
          <img width={40} className="rounded-md" height={40} src="https://i.pinimg.com/1200x/dc/fb/17/dcfb17e9334c906c8a62273ae0a34900.jpg" />
          <p>Ali Matar</p>
        </div>
      </SidebarFooter> 
    </Sidebar>
  )
}