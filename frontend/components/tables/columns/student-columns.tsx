"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"

export type StudentData = {
  student_id: string
  student_name: string
  attendance_rate: number
}

export const studentColumns: ColumnDef<StudentData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
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
