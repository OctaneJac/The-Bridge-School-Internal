"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"

export type AllStudentData = {
  student_id: string
  student_name: string
  class_name: string | null
  attendance_rate: number
}

export const allStudentsColumns: ColumnDef<AllStudentData>[] = [
  {
    accessorKey: "student_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const name = row.getValue("student_name") as string
      return <div className="max-w-[200px] font-medium">{name}</div>
    },
    enableSorting: true,
  },
  {
    accessorKey: "class_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Class" />,
    cell: ({ row }) => {
      const className = row.getValue("class_name") as string | null
      return (
        <div className="text-sm">
          {className || <span className="text-muted-foreground">No class</span>}
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "attendance_rate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Attendance Rate" />,
    cell: ({ row }) => {
      const rate = row.getValue("attendance_rate") as number
      return (
        <div className="font-mono text-sm">
          {rate.toFixed(1)}%
        </div>
      )
    },
    enableSorting: true,
  },
]
