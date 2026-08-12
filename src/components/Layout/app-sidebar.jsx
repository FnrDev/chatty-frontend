import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { TeamSwitcher } from "../Other/team-switcher"
import CreateChannel from "../Channel/CreateChannel"
import { useEffect, useState } from "react"
import api from "@/services/api"
import { Link, useParams } from "react-router"
import { Hash } from "lucide-react"
import WorkSpaceSettings from "../Channel/WorkSpaceSettings"
import UserProfileSettings from "./UserProfileSettings"

export function AppSidebar(props) {

  const [channels, setChannels] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogWorkSpace, setDialogWorkSpace] = useState(false);
  const [dialogProfile, setDialogProfile] = useState(false);
  const [updatedWorkspace, setUpdatedWorkspace] = useState(null);

  const { id, channelId } = useParams()

  useEffect(() => {
    let ignore = false

    async function getChannels() {
      try {
        const response = await api.get(`/workspaces/${id}/channels`)
        if (!ignore) setChannels(response.data)
      } catch(err) {
        console.log(err)
      }
    }

    getChannels()

    return () => {
      ignore = true
    }
  }, [id])

  return (
    <Sidebar {...props} >
      <SidebarHeader className="px-2.5">
        <Link to={'/'}>
          <div className="flex items-center gap-1 mb-1">
            <img src="/logo.svg" width={50} height={50} />
            <h2 className="text-2xl">Chatty</h2>
          </div>
        </Link>
      <TeamSwitcher updatedWorkspace={updatedWorkspace} />
      </SidebarHeader>
      <SidebarContent className="px-2.5 mt-1">
        <WorkSpaceSettings
          open={dialogWorkSpace}
          onOpenChange={setDialogWorkSpace}
          onUpdated={setUpdatedWorkspace}
        />
        <CreateChannel 
           open={dialogOpen}
           onOpenChange={setDialogOpen}
           onCreated={(workspace) =>
             setChannels((currentChannels) => [...currentChannels, workspace])
           }
        />
        <div className="flex flex-col gap-3 mt-5">
          {channels.map((e) => {
          return(
           <Link key={e._id} to={`/workspaces/${id}/${e._id}`}>
             <div className={`flex flex-col gap-1 rounded-lg p-2 px-3 ${channelId === e._id ? "bg-sidebar-accent" : ""}`}>
              <p className="text-[14px] flex items-center gap-2"><Hash size={15} className="text-white/60" /> {e.name}</p>
            </div>
           </Link>
          )
        })}
        </div>
      </SidebarContent>
      <SidebarFooter>
        <UserProfileSettings
          open={dialogProfile}
          onOpenChange={setDialogProfile}
        />
      </SidebarFooter> 
    </Sidebar>
  )
}
