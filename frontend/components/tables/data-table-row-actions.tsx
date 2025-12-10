"use client"

import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableRowActionsProps<TData> {
  row: TData
  actions: {
    label: string
    onClick: (row: TData) => void
    disabled?: boolean
    divider?: boolean
  }[]
}

export function DataTableRowActions<TData>({ row, actions }: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {actions.map((action, index) => (
          <>
            <DropdownMenuItem key={`action-${index}`} onClick={() => action.onClick(row)} disabled={action.disabled}>
              {action.label}
            </DropdownMenuItem>
            {action.divider && <DropdownMenuSeparator />}
          </>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
