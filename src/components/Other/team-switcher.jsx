import * as React from "react"
import { AudioWaveform, ChevronsUpDown, Command, GalleryVerticalEnd, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

// Mock data — replace with real teams once the backend is wired up.
const teams = [
  { name: "Acme Inc", logo: GalleryVerticalEnd },
  { name: "Acme Corp.", logo: AudioWaveform },
  { name: "Evil Corp.", logo: Command },
]

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  if (!activeTeam) {
    return null
  }

  const ActiveLogo = activeTeam.logo

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
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <img width={60} className="rounded-md" height={60} src="https://i.pinimg.com/736x/51/07/05/510705601bbc0bb510cfb0eff2b242d6.jpg" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate text-[1rem] font-medium">{activeTeam.name}</span>
              <span className="text-xs text-muted-foreground">8,720 Member</span>
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
              {teams.map((team, index) => {
                const TeamLogo = team.logo
                return (
                  <DropdownMenuItem
                    key={team.name}
                    className="gap-2 p-2"
                    onClick={() => setActiveTeam(team)}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      <TeamLogo className="size-3.5 shrink-0" />
                    </div>
                    {team.name}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add Workspace</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
