"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useBranch } from "@/contexts/branch-context"
import { studentColumns, type StudentData } from "@/components/tables/columns/student-columns"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, ArrowUp } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-2"
          >
            ← Back
          </Button>
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
      return row?.original.student_id
    }).filter(Boolean) as string[]

    onGenerateReport(selectedIds)
  }

  const handlePromote = () => {
    const selectedRowIds = Object.keys(rowSelection)
    const selectedIds = selectedRowIds.map((rowId) => {
      const row = table.getRowModel().rows.find((r) => r.id === rowId)
      return row?.original.student_id
    }).filter(Boolean) as string[]

    onPromote(selectedIds)
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

interface GenerateReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedStudentIds: string[]
}

function GenerateReportDialog({
  open,
  onOpenChange,
  selectedStudentIds,
}: GenerateReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
          <DialogDescription>
            Generate a report for the selected students.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Selected students: {selectedStudentIds.length}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This feature will be implemented soon.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface Class {
  id: number
  name: string
}

interface PromoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedStudentIds: string[]
  currentBranchId: number | null
  onPromoteSuccess: () => void
}

function PromoteDialog({
  open,
  onOpenChange,
  selectedStudentIds,
  currentBranchId,
  onPromoteSuccess,
}: PromoteDialogProps) {
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [promoting, setPromoting] = useState(false)
  const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL

  // Fetch classes when dialog opens
  useEffect(() => {
    if (open && currentBranchId) {
      const fetchClasses = async () => {
        try {
          setLoading(true)
          const response = await fetch(
            `${backend_url}/classes/${currentBranchId}`
          )

          if (response.ok) {
            const classesData = await response.json()
            setClasses(classesData)
          } else {
            console.error("Error fetching classes:", response.statusText)
          }
        } catch (error) {
          console.error("Error fetching classes:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchClasses()
    } else {
      setSelectedClassId("")
    }
  }, [open, currentBranchId, backend_url])

  const handlePromote = async () => {
    if (!selectedClassId || selectedStudentIds.length === 0) {
      return
    }

    try {
      setPromoting(true)
      const response = await fetch(
        `${backend_url}/promote/${selectedClassId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedStudentIds),
        }
      )

      if (response.ok) {
        onPromoteSuccess()
        setSelectedClassId("")
        onOpenChange(false)
      } else {
        const error = await response.json()
        console.error("Error promoting students:", error)
        alert(error.error || "Failed to promote students")
      }
    } catch (error) {
      console.error("Error promoting students:", error)
      alert("Failed to promote students")
    } finally {
      setPromoting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promote Students</DialogTitle>
          <DialogDescription>
            Select a class to promote {selectedStudentIds.length} selected student(s) to.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Class</label>
                <Select
                  value={selectedClassId}
                  onValueChange={setSelectedClassId}
                  disabled={promoting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id.toString()}>
                        {classItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedStudentIds.length} student(s) will be promoted to the selected class.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={promoting}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePromote}
            disabled={promoting || !selectedClassId || loading}
          >
            {promoting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Promote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
