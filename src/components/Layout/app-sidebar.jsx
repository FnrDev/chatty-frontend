import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { TeamSwitcher } from "../Other/team-switcher"
import CreateChannel from "../Channel/CreateChannel"
import { useAuth } from "@/context/AuthContext"
import { useState } from "react"

export function AppSidebar(props) {

  const { user } = useAuth()
  const [channels, setChannels] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Sidebar {...props} >
      <SidebarHeader className="px-2.5">
        <div className="flex items-center gap-1 mb-1">
          <img src="/logo.svg" width={50} height={50} />
          <h2 className="text-2xl">Chatty</h2>
        </div>
      <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent className="px-2.5 mt-1">
        <CreateChannel 
           open={dialogOpen}
           onOpenChange={setDialogOpen}
           onCreated={(workspace) => setChannels([...channels, workspace])}
        />
        <div className="flex flex-col gap-3 mt-5">
          {channels.map((e) => {
          return(
            <div className="flex p-1.5 px-3 flex-col gap-1 bg-sidebar-accent rounded-lg">
              <p className="text-[14px]"># {e.name}</p>
            </div>
          )
        })}
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="bg-popover rounded-md flex items-center gap-3 p-3">
          <img width={40} className="rounded-md" height={40} src="https://i.pinimg.com/1200x/dc/fb/17/dcfb17e9334c906c8a62273ae0a34900.jpg" />
          <p>{user.username}</p>
        </div>
      </SidebarFooter> 
    </Sidebar>
  )
}