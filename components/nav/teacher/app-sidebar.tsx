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

import { NavMain } from "@/components/nav/teacher/nav-main"
import { NavUser } from "@/components/nav/admin/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useBranch, type Branch } from "@/contexts/branch-context"

// Teacher navigation items
const teacherNavItems = [
  {
    title: "Courses",
    url: "/teacher/courses",
    icon: BookOpen,
  },
  {
    title: "Classes",
    url: "/teacher/classes",
    icon: LayoutGrid,
  },
]

export function TeacherSidebar({ 
  branch,
  ...props 
}: React.ComponentProps<typeof Sidebar> & { 
  branch?: Branch | null
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

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {branch ? (
          // Teacher: show branch name (non-interactive)
          <div className="px-2 py-1.5">
            <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium">
              <Building2 className="size-4" />
              <span className="truncate">{branch.name}</span>
            </div>
          </div>
        ) : null}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={teacherNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

