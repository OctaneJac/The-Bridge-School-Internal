"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Building2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
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
import { useBranch, type Branch } from "@/contexts/branch-context"

export function TeamSwitcher({
  teams,
  branches,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
    id?: number
    branch?: Branch
  }[]
  branches?: Branch[]
}) {
  const { isMobile } = useSidebar()
  const { currentBranch, setCurrentBranch, setCurrentBranchId } = useBranch()
  const { data: session, update } = useSession()
  const router = useRouter()
  const [isUpdating, setIsUpdating] = React.useState(false)
  
  // Find active team based on current branch
  const activeTeam = React.useMemo(() => {
    if (currentBranch && teams.length > 0) {
      return teams.find(team => team.id === currentBranch.id) || teams[0]
    }
    return teams[0]
  }, [currentBranch, teams])

  const handleTeamChange = async (team: typeof teams[0]) => {
    if (team.id && currentBranch && team.id === currentBranch.id) {
      // Branch already selected
      return
    }
    
    if (!team.id) return
    
    setIsUpdating(true)
    
    try {
      // Validate branch exists (API only validates, doesn't update database)
      const response = await fetch("/api/auth/update-branch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ branch_id: team.id }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to update branch" }))
        console.error("Failed to update branch:", error)
        setIsUpdating(false)
        return
      }

      // Use the branch data from the team object or find it in branches array
      const fullBranch = team.branch || branches?.find(b => b.id === team.id)
      if (fullBranch) {
        // Update local context
        setCurrentBranch(fullBranch)
        setCurrentBranchId(fullBranch.id)
        
        // Update session token with new branch_id (no database change)
        await update({
          branch_id: fullBranch.id,
        })
        
        // Refresh server components to use new branch_id from session
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating branch:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!activeTeam || teams.length === 0) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <activeTeam.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Branches
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => handleTeamChange(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <team.logo className="size-3.5 shrink-0" />
                </div>
                {team.name}
                <span className="ml-auto text-xs text-muted-foreground">
                  {team.plan}
                </span>
              </DropdownMenuItem>
            ))}
            
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

