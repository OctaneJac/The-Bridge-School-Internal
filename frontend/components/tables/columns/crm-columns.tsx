"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"

export type CRMData = {
  id: string
  name: string
  phoneNumber: string
  email: string
  convertedOn: string
  source: "YouTube" | "Instagram" | "X"
  campaign: string
  timeToConversion: number // in days
}

// Source configuration with custom colors
const sourceConfig = {
  YouTube: {
    label: "YouTube",
    bgColor: "#FF0000", 
    textColor: "#FFFFFF"
  },
  Instagram: {
    label: "Instagram", 
    bgColor: "#f7548c", 
    textColor: "#FFFFFF"  
  },
  X: {
    label: "X",
    bgColor: "#000000", 
    textColor: "#FFFFFF"
}
} as const

// Helper function to format time to conversion
const formatTimeToConversion = (days: number): string => {
  if (days < 1) {
    const hours = Math.floor(days * 24)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
  }
  
  if (days < 7) {
    return `${Math.floor(days)} ${Math.floor(days) === 1 ? 'day' : 'days'}`
  }
  
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    const remainingDays = Math.floor(days % 7)
    if (remainingDays === 0) {
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
    }
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}, ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`
  }
  
  const months = Math.floor(days / 30)
  const remainingDays = Math.floor(days % 30)
  if (remainingDays === 0) {
    return `${months} ${months === 1 ? 'month' : 'months'}`
  }
  return `${months} ${months === 1 ? 'month' : 'months'}, ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`
}

export const crmColumns: ColumnDef<CRMData>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      return <div className="max-w-[200px] font-medium">{name}</div>
    },
    enableSorting: true,
  },
  {
    accessorKey: "phoneNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone Number" />,
    cell: ({ row }) => {
      const phoneNumber = row.getValue("phoneNumber") as string
      return <div className="font-mono text-sm text-muted-foreground">{phoneNumber}</div>
    },
    enableSorting: true,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => {
      const email = row.getValue("email") as string
      return (
        <div className="max-w-[250px] truncate text-sm text-muted-foreground">
          {email}
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "convertedOn",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Converted On" />,
    cell: ({ row }) => {
      const date = row.getValue("convertedOn") as string
      return <div className="text-sm text-muted-foreground">{new Date(date).toLocaleDateString()}</div>
    },
    enableSorting: true,
  },
  {
    accessorKey: "source",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
    cell: ({ row }) => {
      const source = row.getValue("source") as keyof typeof sourceConfig
      const config = sourceConfig[source]
      
      // Fallback if source is not in config
      if (!config) {
        return <div className="font-medium">{source}</div>
      }
      
      return (
        <div className="flex items-center gap-2">
          <Badge
            className="text-xs border-0"
            style={{
              backgroundColor: config.bgColor,
              color: config.textColor
            }}
          >
            {config.label}
          </Badge>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "campaign",
    header: ({ column }) => (
      <div>
        <DataTableColumnHeader column={column} title="Campaign" />
      </div>
    ),
    cell: ({ row }) => {
      const campaign = row.getValue("campaign") as string

      return (
        <div className="flex items-center gap-2 max-w-[300px]">
          <Badge
            className="text-xs truncate"
             variant="outline"
          >
            {campaign}
          </Badge>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "timeToConversion",
    header: ({ column }) => (
      <div>
        <DataTableColumnHeader column={column} title="Time to Conversion" />
      </div>
    ),
    cell: ({ row }) => {
      const timeToConversion = row.getValue("timeToConversion") as number
      
      return (
        <div className="flex items-center gap-4">
          <div className="font-mono tabular-nums text-sm">
            {formatTimeToConversion(timeToConversion)}
          </div>
        </div>
      )
    },
    enableSorting: true,
  },
]
