"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useBranch } from "@/contexts/branch-context"
import { studentColumns, type StudentData } from "@/components/tables/columns/student-columns"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, ArrowUp } from "lucide-react"
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Table,
} from "@tanstack/react-table"
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTablePagination } from "@/components/tables/data-table-pagination"
import { DataTableViewOptions } from "@/components/tables/data-table-view-options"
import { PromoteDialog } from "@/components/promote-dialog"
import { GenerateReportDialog } from "@/components/generate-report-dialog"

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { currentBranchId } = useBranch()
  const classId = params.id as string
  const [students, setStudents] = useState<StudentData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false)
  const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL

  // Fetch students for this class
  useEffect(() => {
    if (!currentBranchId || !classId) {
      setLoading(false)
      return
    }

    const fetchStudents = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `${backend_url}/admin/class_students/${classId}`
        )
        console.log(response)
        if (response.ok) {
          const studentsData = await response.json()
          setStudents(studentsData)
        } else {
          console.error("Error fetching students:", response.statusText)
        }
      } catch (error) {
        console.error("Error fetching students:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [currentBranchId, classId, backend_url])

  if (!currentBranchId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No branch selected</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Class Students</h1>
          <p className="text-muted-foreground">
            View and manage students in this class
          </p>
        </div>
      </div>

      <ClassStudentsTable
        data={students}
        onGenerateReport={(ids) => {
          setSelectedStudentIds(ids)
          setReportDialogOpen(true)
        }}
        onPromote={(ids) => {
          setSelectedStudentIds(ids)
          setPromoteDialogOpen(true)
        }}
      />

      <GenerateReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        selectedStudentIds={selectedStudentIds}
        classId={classId}
      />

      <PromoteDialog
        open={promoteDialogOpen}
        onOpenChange={setPromoteDialogOpen}
        selectedStudentIds={selectedStudentIds}
        currentBranchId={currentBranchId}
        onPromoteSuccess={() => {
          // Refresh students after promotion
          const fetchStudents = async () => {
            try {
              const response = await fetch(
                `${backend_url}/admin/class_students/${classId}`
              )
              if (response.ok) {
                const studentsData = await response.json()
                setStudents(studentsData)
              }
            } catch (error) {
              console.error("Error refreshing students:", error)
            }
          }
          fetchStudents()
        }}
      />
    </div>
  )
}

interface ClassStudentsTableProps {
  data: StudentData[]
  onGenerateReport: (selectedStudentIds: string[]) => void
  onPromote: (selectedStudentIds: string[]) => void
}

function ClassStudentsTable({ data, onGenerateReport, onPromote }: ClassStudentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns: studentColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id.toString(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const selectedCount = Object.keys(rowSelection).length

  const handleGenerateReport = () => {
    const selectedRowIds = Object.keys(rowSelection)
    const selectedIds = selectedRowIds.map((rowId) => {
      const row = table.getRowModel().rows.find((r) => r.id === rowId)
      return row?.original.id
    }).filter(Boolean) as number[]

    onGenerateReport(selectedIds.map(String))
  }

  const handlePromote = () => {
    const selectedRowIds = Object.keys(rowSelection)
    const selectedIds = selectedRowIds.map((rowId) => {
      const row = table.getRowModel().rows.find((r) => r.id === rowId)
      return row?.original.id
    }).filter(Boolean) as number[]

    onPromote(selectedIds.map(String))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <>
              <Button
                onClick={handleGenerateReport}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Generate Report ({selectedCount})
              </Button>
              <Button
                onClick={handlePromote}
                variant="outline"
                className="gap-2"
              >
                <ArrowUp className="h-4 w-4" />
                Promote ({selectedCount})
              </Button>
            </>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>
      <div className="rounded-md border bg-background">
        <UITable>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b hover:bg-secondary">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="px-4 py-2 text-left font-medium text-white">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={studentColumns.length} className="h-24 text-center text-muted-foreground">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UITable>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}

