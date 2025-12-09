"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
  BookOpen,
  GraduationCap,
  Users,
  LayoutGrid,
  Building2,
} from "lucide-react"

import { NavMain } from "@/components/nav/admin/nav-main"
import { NavUser } from "@/components/nav/admin/nav-user"
import { TeamSwitcher } from "@/components/nav/admin/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useBranch, type Branch } from "@/contexts/branch-context"

// Admin navigation items
const adminNavItems = [
  {
    title: "Courses",
    url: "/admin/courses",
    icon: BookOpen,
  },
  {
    title: "Teachers",
    url: "/admin/teachers",
    icon: GraduationCap,
  },
  {
    title: "Students",
    url: "/admin/students",
    icon: Users,
  },
  {
    title: "Classes",
    url: "/admin/classes",
    icon: LayoutGrid,
  },
]

export function AdminSidebar({ 
  branch,
  allBranches = [],
  userRole,
  ...props 
}: React.ComponentProps<typeof Sidebar> & { 
  branch?: Branch | null
  allBranches?: Branch[]
  userRole?: string
}) {
  const { data: session } = useSession()
  const user = session?.user as any
  const { setCurrentBranch, setCurrentBranchId } = useBranch()

  // Update context when branch prop changes
  React.useEffect(() => {
    if (branch) {
      setCurrentBranch(branch)
      setCurrentBranchId(branch.id)
    }
  }, [branch, setCurrentBranch, setCurrentBranchId])

  // Prepare user data for NavUser component
  const userData = React.useMemo(() => {
    if (!user) {
      return {
        name: "",
        email: "",
        firstName: null,
        lastName: null,
      }
    }

    return {
      name: user.name || user.email || "",
      email: user.email || "",
      firstName: user.first_name,
      lastName: user.last_name,
    }
  }, [user])

  // For super_admin: show all branches in TeamSwitcher
  // For admin/teacher: show only their branch (no switcher)
  const branchesToShow = React.useMemo(() => {
    if (userRole === "super_admin" && allBranches.length > 0) {
      return allBranches
    }
    return branch ? [branch] : []
  }, [branch, allBranches, userRole])

  const teams = React.useMemo(() => {
    return branchesToShow.map(b => ({
      name: b.name,
      logo: Building2,
      plan: "Primary",
      id: b.id,
      branch: b, // Include full branch data
    }))
  }, [branchesToShow])

  // Show team switcher only for super_admin
  const showTeamSwitcher = userRole === "super_admin"

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {showTeamSwitcher ? (
          // Super admin: show TeamSwitcher with all branches
          <TeamSwitcher teams={teams} branches={branchesToShow} />
        ) : branch ? (
          // Admin/Teacher: show branch name (non-interactive)
          <div className="px-2 py-1.5">
            <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium">
              <Building2 className="size-4" />
              <span className="truncate">{branch.name}</span>
            </div>
          </div>
        ) : null}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={adminNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

