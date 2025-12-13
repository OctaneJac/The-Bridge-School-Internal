"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useBranch } from "@/contexts/branch-context"
import { DataTable } from "@/components/tables/data-table"
import { createTeacherColumns, type TeacherData } from "@/components/tables/columns/teacher-columns"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, Plus } from "lucide-react"

export default function TeachersPage() {
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role
  const isSuperAdmin = userRole === "super_admin"
  const { currentBranchId } = useBranch()
  const [teachers, setTeachers] = useState<TeacherData[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [regeneratingPassword, setRegeneratingPassword] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [regeneratePasswordDialogOpen, setRegeneratePasswordDialogOpen] = useState(false)
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null)
  const [teacherToRegeneratePassword, setTeacherToRegeneratePassword] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  })
  const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL

  // Fetch teachers
  useEffect(() => {
    if (!currentBranchId) {
      setLoading(false)
      return
    }

    const fetchTeachers = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `${backend_url}/admin/teacher_details/${currentBranchId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        )

        if (response.ok) {
          const teachersData = await response.json()
          // Transform the data to match our TeacherData type
          // The backend should return: id, email, first_name, last_name, password (if super_admin), assigned_class_name, assigned_courses
          // If the backend doesn't return these fields yet, we'll structure it to handle that
          const transformedTeachers: TeacherData[] = teachersData.map((teacher: any) => ({
            id: teacher.id,
            email: teacher.email,
            first_name: teacher.first_name,
            last_name: teacher.last_name,
            password: isSuperAdmin ? teacher.password : undefined,
            assigned_class_name: teacher.assigned_class_name || teacher.class_name || null,
            assigned_courses: teacher.assigned_courses || teacher.courses || null,
          }))
          setTeachers(transformedTeachers)
        } else {
          console.error("Error fetching teachers:", response.statusText)
        }
      } catch (error) {
        console.error("Error fetching teachers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeachers()
  }, [currentBranchId, backend_url, isSuperAdmin])

  const handleCreateTeacher = async () => {
    if (!formData.first_name.trim() || !formData.email.trim() || !formData.password.trim()) {
      return
    }

    try {
      setCreating(true)
      const response = await fetch(
        `${backend_url}/admin/create-teacher/${currentBranchId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            role: "teacher",
          }),
        }
      )

      if (response.ok) {
        // Refresh teachers list
        const refreshResponse = await fetch(
          `${backend_url}/admin/teacher_details/${currentBranchId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        )
        if (refreshResponse.ok) {
          const teachersData = await refreshResponse.json()
          const transformedTeachers: TeacherData[] = teachersData.map((teacher: any) => ({
            id: teacher.id,
            email: teacher.email,
            first_name: teacher.first_name,
            last_name: teacher.last_name,
            assigned_class_name: teacher.assigned_class_name || teacher.class_name || null,
            assigned_courses: teacher.assigned_courses || teacher.courses || null,
          }))
          setTeachers(transformedTeachers)
        }
        setFormData({ first_name: "", last_name: "", email: "", password: "" })
        setDialogOpen(false)
      } else {
        const error = await response.json()
        console.error("Error creating teacher:", error)
        alert(error.error || "Failed to create teacher")
      }
    } catch (error) {
      console.error("Error creating teacher:", error)
      alert("Failed to create teacher")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteTeacher = async (teacherId: string) => {
    try {
      setDeleting(teacherId)
      const response = await fetch(
        `${backend_url}/admin/delete-teacher/${teacherId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      )

      if (response.ok) {
        setTeachers(teachers.filter((t) => t.id !== teacherId))
        setDeleteDialogOpen(false)
        setTeacherToDelete(null)
      } else {
        const error = await response.json()
        console.error("Error deleting teacher:", error)
        alert(error.error || "Failed to delete teacher")
      }
    } catch (error) {
      console.error("Error deleting teacher:", error)
      alert("Failed to delete teacher")
    } finally {
      setDeleting(null)
    }
  }

  const openDeleteDialog = (teacherId: string) => {
    setTeacherToDelete(teacherId)
    setDeleteDialogOpen(true)
  }

  const openRegeneratePasswordDialog = (teacherId: string) => {
    setTeacherToRegeneratePassword(teacherId)
    setNewPassword("")
    setRegeneratePasswordDialogOpen(true)
  }

  const handleRegeneratePassword = async () => {
    if (!teacherToRegeneratePassword || !newPassword.trim()) {
      return
    }

    try {
      setRegeneratingPassword(teacherToRegeneratePassword)
      const response = await fetch(
        `${backend_url}/admin/change_teacher_password/${teacherToRegeneratePassword}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            password: newPassword.trim(),
          }),
        }
      )

      if (response.ok) {
        setRegeneratePasswordDialogOpen(false)
        setTeacherToRegeneratePassword(null)
        setNewPassword("")
        alert("Password updated successfully")
      } else {
        const error = await response.json()
        console.error("Error updating password:", error)
        alert(error.error || "Failed to update password")
      }
    } catch (error) {
      console.error("Error updating password:", error)
      alert("Failed to update password")
    } finally {
      setRegeneratingPassword(null)
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

  const columns = createTeacherColumns({
    onDelete: openDeleteDialog,
    onRegeneratePassword: isSuperAdmin ? openRegeneratePasswordDialog : undefined,
    deletingId: deleting,
    regeneratingPasswordId: regeneratingPassword,
    isSuperAdmin,
  })

  const getTeacherName = (teacher: TeacherData) => {
    const firstName = teacher.first_name || ""
    const lastName = teacher.last_name || ""
    return `${firstName} ${lastName}`.trim() || teacher.email
  }

  return (
    <div className="space-y-6 px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
          <p className="text-muted-foreground">
            Manage all teachers in the branch
          </p>
        </div>
        {isSuperAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
                <DialogDescription>
                  Enter the teacher's information to create a new teacher account.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    placeholder="Enter first name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    placeholder="Enter last name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Username (Email)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
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
                  onClick={handleCreateTeacher}
                  disabled={
                    creating ||
                    !formData.first_name.trim() ||
                    !formData.email.trim() ||
                    !formData.password.trim()
                  }
                >
                  {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <DataTable
        columns={columns}
        data={teachers}
        filterColumn="name"
        filterPlaceholder="Filter by name..."
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the teacher
              {teacherToDelete && teachers.find((t) => t.id === teacherToDelete) && (
                <span className="font-semibold">
                  {" "}
                  "{getTeacherName(teachers.find((t) => t.id === teacherToDelete)!)}"
                </span>
              )}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false)
                setTeacherToDelete(null)
              }}
              disabled={deleting !== null}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => teacherToDelete && handleDeleteTeacher(teacherToDelete)}
              disabled={deleting !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting !== null && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={regeneratePasswordDialogOpen} onOpenChange={setRegeneratePasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Password</DialogTitle>
            <DialogDescription>
              Enter a new password for{" "}
              {teacherToRegeneratePassword && teachers.find((t) => t.id === teacherToRegeneratePassword) && (
                <span className="font-semibold">
                  {getTeacherName(teachers.find((t) => t.id === teacherToRegeneratePassword)!)}
                </span>
              )}
              .
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !regeneratingPassword && newPassword.trim()) {
                    handleRegeneratePassword()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRegeneratePasswordDialogOpen(false)
                setTeacherToRegeneratePassword(null)
                setNewPassword("")
              }}
              disabled={regeneratingPassword !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegeneratePassword}
              disabled={regeneratingPassword !== null || !newPassword.trim()}
            >
              {regeneratingPassword !== null && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
