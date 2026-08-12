import { useEffect, useState } from "react"
import { AudioWaveform, ChevronsUpDown, Command, GalleryVerticalEnd, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import CreateWorkspace from "@/components/Workspace/CreateWorkspace"
import api from "@/services/api"
import { useNavigate, useParams } from "react-router"

export function TeamSwitcher({ updatedWorkspace }) {
  const { isMobile } = useSidebar()
  const [workSpaces, setWorkSpaces] = useState([])
  const [activeTeam, setActiveTeam] = useState(workSpaces[0])
  const [workSpaceDetails, setWorkSpaceDetails] = useState()
  const [dialogOpen, setDialogOpen] = useState(false)

  const navigate = useNavigate();
  const { id: routeId } = useParams()


  async function loadWorkspace(id) {
    try {
      const detailsResponse = await api.get(`/workspaces/${id}`)
      setWorkSpaceDetails(detailsResponse.data)
      setActiveTeam(detailsResponse.data)
    } catch (err) {
      console.log(err)
    }
  }

  async function selectWorkspace(id) {
    await loadWorkspace(id)
    navigate(`/workspaces/${id}`)
  }

  useEffect(() => {
    async function loadData() {
      try {
        const response = await api.get("/workspaces")
        const workspacesData = response.data
        setWorkSpaces(workspacesData)

        if (routeId) {
          // already on a workspace URL (possibly with a channel) — just load it
          await loadWorkspace(routeId)
        } else if (workspacesData?.[0]?._id) {
          await selectWorkspace(workspacesData[0]._id)
        }
      } catch (err) {
        console.log(err)
      }
    }
    loadData()
  }, [routeId])

  if (!activeTeam) {
    return null
  }

  function applyUpdate(workspace) {
    return updatedWorkspace && workspace._id === updatedWorkspace._id
      ? {
          ...workspace,
          name: updatedWorkspace.name,
          imageURL: updatedWorkspace.imageURL,
        }
      : workspace
  }

  const activeWorkspace = applyUpdate(activeTeam)
  const teams = workSpaces.map(applyUpdate)

  const memberCount = activeWorkspace.members?.length ?? 0

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-popup-open:bg-sidebar-border rounded-lg gap-3 h-13 bg-popover data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-sidebar-accent text-sidebar-primary-foreground">
              {activeWorkspace.imageURL ? (
                <img
                  src={activeWorkspace.imageURL}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                activeWorkspace.name[0].toUpperCase()
              )}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate text-[1rem] font-medium">{activeWorkspace.name}</span>
              <span className="text-xs text-muted-foreground">{memberCount} {memberCount === 1 ? "Member" : "Members"}</span>
            </div>
            <ChevronsUpDown className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Workspaces
              </DropdownMenuLabel>
              {teams.map((team) => {
                return (
                  <DropdownMenuItem
                    key={team._id}
                    className="gap-2 p-2"
                    onClick={() => selectWorkspace(team._id)}
                  >
                    <div className="flex size-6 items-center justify-center overflow-hidden rounded-md border">
                      {team.imageURL ? (
                        <img
                          src={team.imageURL}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        team.name[0].toUpperCase()
                      )}
                    </div>
                    {team.name}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => setDialogOpen(true)}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add Workspace</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <CreateWorkspace
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onCreated={(workspace) => setWorkSpaces([...workSpaces, workspace])}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
