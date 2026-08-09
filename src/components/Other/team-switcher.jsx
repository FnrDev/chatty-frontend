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
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import api from "@/services/api"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const [workSpaces, setWorkSpaces] = useState([])
  const [activeTeam, setActiveTeam] = useState(workSpaces[0])
  const [workSpaceDetails, setWorkSpaceDetails] = useState()
  const [dialogOpen, setDialogOpen] = useState(false)

  const navigate = useNavigate();


  async function selectWorkspace(id) {
    try {
      const detailsResponse = await api.get(`/workspaces/${id}`)
      setWorkSpaceDetails(detailsResponse.data)
      setActiveTeam(detailsResponse.data)
      navigate(`/${id}`)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        const response = await api.get("/workspaces")
        const workspacesData = response.data
        setWorkSpaces(workspacesData)

        if (workspacesData && workspacesData.length > 0) {
          await selectWorkspace(workspacesData[0]._id)
        }
      } catch (err) {
        console.log(err)
      }
    }
    loadData()
  }, [])

  const {
      register,
      handleSubmit,
      formState: { errors },
      setError
  } = useForm()

  async function onSubmit(data) {
    try {
      const created = await api.post("/workspaces", data)
      console.log(created.data)
      setWorkSpaces([...workSpaces, created.data])
      setDialogOpen(!dialogOpen)
    } catch (err) {
      console.log(err)
      setError("server", {
        type: "server",
        message: err.response?.data?.message || "Something went wrong",
      });
    }
  }

  if (!activeTeam) {
    return null
  }

  const memberCount = activeTeam.members?.length ?? 0

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
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-primary-foreground">
              {activeTeam.name[0].toUpperCase()}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate text-[1rem] font-medium">{activeTeam.name}</span>
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
              {workSpaces.map((team, index) => {
                return (
                  <DropdownMenuItem
                    key={team._id}
                    className="gap-2 p-2"
                    onClick={() => selectWorkspace(team._id)}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      {team.name[0].toUpperCase()}
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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Create New WorkSpace</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Name <span className="text-destructive">*</span></FieldLabel>
                    <Input id="name" {...register("name", {required: true, min: 3, max: 100})} autoComplete="off" placeholder="Set workspace name" />
                    {errors.name && (<span className="text-red-500 text-sm">{errors.name}</span>)}
                  </Field>
                </FieldGroup>
                <Field orientation="vertical">
                  <Button type="submit">Create</Button>
                  <DialogClose
                    render={<Button variant="outline" className="w-full" type="button" />}
                  >
                    Cancel
                  </DialogClose>
                </Field>
              </FieldSet>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
