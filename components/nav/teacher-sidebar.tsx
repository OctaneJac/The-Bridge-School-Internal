"use client"

import * as React from "react"
import {
  LayoutDashboard,
  BookOpen,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav/nav-main"
import { NavUser } from "@/components/nav/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Dashboard",
    url: "/teacher",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "My Courses",
    url: "/teacher/courses",
    icon: BookOpen,
  },
  {
    title: "My Classes",
    url: "/teacher/classes",
    icon: Users,
  },
]

interface TeacherSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

export function TeacherSidebar({ user, ...props }: TeacherSidebarProps) {
  // Create initials from first and last name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <span className="text-xs font-semibold">TBS</span>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">The Bridge School</span>
            <span className="truncate text-xs">Teacher Portal</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser 
          user={{
            name: fullName,
            email: user.email,
            avatar: "",
            initials: getInitials(user.firstName, user.lastName),
          }} 
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
