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
import { Link, useNavigate, useParams } from "react-router"
import { Hash, Users } from "lucide-react"
import WorkSpaceSettings from "../Channel/WorkSpaceSettings"
import UserProfileSettings from "./UserProfileSettings"
import ChannelActions from "../Channel/ChannelActions"

export function AppSidebar(props) {

  const [channels, setChannels] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogWorkSpace, setDialogWorkSpace] = useState(false);
  const [dialogProfile, setDialogProfile] = useState(false);
  const [updatedWorkspace, setUpdatedWorkspace] = useState(null);

  const { id, channelId } = useParams()
  const navigate = useNavigate()

  function handleChannelDeleted(deletedChannelId) {
    setChannels((currentChannels) =>
      currentChannels.filter((channel) => channel._id !== deletedChannelId)
    )

    if (channelId === deletedChannelId) {
      navigate(`/workspaces/${id}`, { replace: true })
    }
  }

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
        <div className="mt-5 flex flex-col gap-3">
          <Link to={`/workspaces/${id}`}>
            <div className={`flex items-center gap-2 rounded-lg p-2 px-3 ${!channelId ? "bg-sidebar-accent" : ""}`}>
              <Users size={15} className="text-white/60" />
              <span className="text-[14px]">Members</span>
            </div>
          </Link>
          {channels.map((e) => {
          return(
             <div key={e._id} className={`flex items-center rounded-lg ${channelId === e._id ? "bg-sidebar-accent" : ""}`}>
              <Link
                className="flex min-w-0 flex-1 items-center gap-2 p-2 px-3"
                to={`/workspaces/${id}/${e._id}`}
              >
                <Hash size={15} className="shrink-0 text-white/60" />
                <span className="truncate text-[14px]">{e.name}</span>
              </Link>
              <ChannelActions
                channel={e}
                workspaceId={id}
                onUpdated={(updatedChannel) =>
                  setChannels((currentChannels) =>
                    currentChannels.map((channel) =>
                      channel._id === updatedChannel._id ? updatedChannel : channel
                    )
                  )
                }
                onDeleted={handleChannelDeleted}
              />
             </div>
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
