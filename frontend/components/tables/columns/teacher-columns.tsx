"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2, KeyRound } from "lucide-react"

export type TeacherData = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  assigned_class_name: string | null
  assigned_courses: string[] | null
}

interface TeacherColumnsProps {
  onDelete?: (teacherId: string) => void
  onRegeneratePassword?: (teacherId: string) => void
  deletingId?: string | null
  regeneratingPasswordId?: string | null
  isSuperAdmin?: boolean
}

export const createTeacherColumns = ({
  onDelete,
  onRegeneratePassword,
  deletingId,
  regeneratingPasswordId,
  isSuperAdmin = false,
}: TeacherColumnsProps): ColumnDef<TeacherData>[] => {
  const columns: ColumnDef<TeacherData>[] = [
    {
      accessorFn: (row) => {
        const firstName = row.first_name || ""
        const lastName = row.last_name || ""
        return `${firstName} ${lastName}`.trim() || row.email
      },
      id: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Teacher Name" />,
      cell: ({ row }) => {
        const firstName = row.original.first_name || ""
        const lastName = row.original.last_name || ""
        const name = `${firstName} ${lastName}`.trim() || row.original.email
        return <div className="max-w-[200px] font-medium">{name}</div>
      },
      enableSorting: true,
    },
    {
      accessorKey: "assigned_class_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Assigned Class" />,
      cell: ({ row }) => {
        const className = row.getValue("assigned_class_name") as string | null
        return (
          <div className="text-sm">
            {className || <span className="text-muted-foreground">No class assigned</span>}
          </div>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: "assigned_courses",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Assigned Courses" />,
      cell: ({ row }) => {
        const courses = row.getValue("assigned_courses") as string[] | null
        if (!courses || courses.length === 0) {
          return <span className="text-muted-foreground text-sm">No courses assigned</span>
        }
        return (
          <div className="text-sm">
            {courses.join(", ")}    
          </div>
        )
      },
      enableSorting: false,
    },
  ]

  // Add username column only for super_admin
  if (isSuperAdmin) {
    columns.push({
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Username" />,
      cell: ({ row }) => {
        const email = row.getValue("email") as string
        return <div className="text-sm font-mono">{email}</div>
      },
      enableSorting: true,
    })
  }

  // Add actions column
  columns.push({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const teacherId = row.original.id
      const isDeleting = deletingId === teacherId
      const isRegenerating = regeneratingPasswordId === teacherId
      return (
        <div className="flex items-center gap-2">
          {isSuperAdmin && onRegeneratePassword && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => onRegeneratePassword(teacherId)}
              disabled={isRegenerating || isDeleting}
            >
              {isRegenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <KeyRound className="h-4 w-4 mr-1" />
                  Regenerate Password
                </>
              )}
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(teacherId)}
              disabled={isDeleting || isRegenerating}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      );
    },
    enableSorting: false,
  })

  return columns
}
