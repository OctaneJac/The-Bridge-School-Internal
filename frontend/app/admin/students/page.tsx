"use client"

import { useEffect, useState } from "react"
import { useBranch } from "@/contexts/branch-context"
import { DataTable } from "@/components/tables/data-table"
import { allStudentsColumns, type AllStudentData } from "@/components/tables/columns/all-students-columns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus } from "lucide-react"

export default function StudentsPage() {
  const { currentBranchId } = useBranch()
  const [students, setStudents] = useState<AllStudentData[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
  })
  const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL

  // Fetch students
  useEffect(() => {
    if (!currentBranchId) {
      setLoading(false)
      return
    }

    const fetchStudents = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `${backend_url}/students_all?branch_id=${currentBranchId}`
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
  }, [currentBranchId, backend_url])

  const handleCreateStudent = async () => {
    if (!formData.name.trim() || !formData.dob || !formData.gender) {
      return
    }

    try {
      setCreating(true)
      const response = await fetch(
        `${backend_url}/create-student?branch_id=${currentBranchId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            dob: formData.dob,
            gender: formData.gender,
          }),
        }
      )

      if (response.ok) {
        // Refresh students list
        const refreshResponse = await fetch(
          `${backend_url}/students_all?branch_id=${currentBranchId}`
        )
        if (refreshResponse.ok) {
          const studentsData = await refreshResponse.json()
          setStudents(studentsData)
        }
        setFormData({ name: "", dob: "", gender: "" })
        setDialogOpen(false)
      } else {
        const error = await response.json()
        console.error("Error creating student:", error)
        alert(error.error || "Failed to create student")
      }
    } catch (error) {
      console.error("Error creating student:", error)
      alert("Failed to create student")
    } finally {
      setCreating(false)
    }
  }


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
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage all students in the branch
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Student</DialogTitle>
              <DialogDescription>
                Enter the student's information to create a new student.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter student name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateStudent}
                disabled={creating || !formData.name.trim() || !formData.dob || !formData.gender}
              >
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={allStudentsColumns}
        data={students}
        filterColumn="student_name"
        filterPlaceholder="Filter by name..."
      />
    </div>
  )
}
