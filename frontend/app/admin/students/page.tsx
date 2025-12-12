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

interface Class {
  id: number
  name: string
  branch_id: number
  session_id: number | null
  class_teacher_id: string | null
  created_at: Date
  updated_at: Date
}

export default function StudentsPage() {
  const { currentBranchId } = useBranch()
  const [students, setStudents] = useState<AllStudentData[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [classes, setClasses] = useState<Class[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    class_id: "",
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
          `${backend_url}/admin/students_all/${currentBranchId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
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

  // Fetch classes when dialog opens
  useEffect(() => {
    if (dialogOpen && currentBranchId) {
      const fetchClasses = async () => {
        try {
          setLoadingClasses(true)
          const response = await fetch(
            `${backend_url}/admin/classes/${currentBranchId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
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
          setLoadingClasses(false)
        }
      }

      fetchClasses()
    } else {
      setClasses([])
      setFormData({ name: "", dob: "", gender: "", class_id: "" })
    }
  }, [dialogOpen, currentBranchId, backend_url])

  const handleCreateStudent = async () => {
    if (!formData.name.trim() || !formData.dob || !formData.class_id) {
      return
    }

    try {
      setCreating(true)
      const response = await fetch(
        `${backend_url}/admin/create_student/${currentBranchId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            dob: formData.dob,
            class_id: parseInt(formData.class_id),
          }),
        }
      )

      if (response.ok) {
        // Refresh students list
        const refreshResponse = await fetch(
          `${backend_url}/admin/students_all/${currentBranchId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        if (refreshResponse.ok) {
          const studentsData = await refreshResponse.json()
          setStudents(studentsData)
        }
        setFormData({ name: "", dob: "", gender: "", class_id: "" })
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
    <div className="space-y-6 px-8">
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
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select
                  value={formData.class_id}
                  onValueChange={(value) => setFormData({ ...formData, class_id: value })}
                  disabled={loadingClasses}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingClasses ? "Loading classes..." : "Select class"} />
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
                disabled={creating || !formData.name.trim() || !formData.dob || !formData.class_id || loadingClasses}
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
