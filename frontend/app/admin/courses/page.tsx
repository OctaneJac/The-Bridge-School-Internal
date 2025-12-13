"use client"

import { useEffect, useState } from "react"
import { useBranch } from "@/contexts/branch-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Trash2 } from "lucide-react"
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
import { AssignCourseDialog } from "@/components/assign-course-dialog"

interface Course {
  id: number
  name: string
  [key: string]: any // Allow for additional fields from backend
}

export default function CoursesPage() {
  const { currentBranchId } = useBranch()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [newCourseName, setNewCourseName] = useState("")
  const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL

  // Fetch courses
  useEffect(() => {
    if (!currentBranchId) {
      setLoading(false)
      return
    }

    const fetchCourses = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${backend_url}/admin/get-courses/${currentBranchId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        })

        if (response.ok) {
          const coursesData = await response.json()
          setCourses(coursesData)
        } else {
          console.error("Error fetching courses:", response.statusText)
        }
      } catch (error) {
        console.error("Error fetching courses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [currentBranchId, backend_url])

  const handleCreateCourse = async () => {
    if (!newCourseName.trim()) {
      return
    }

    try {
      setCreating(true)
      const response = await fetch(`${backend_url}/admin/add-course/${currentBranchId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          name: newCourseName.trim(),
        }),
      })

      if (response.ok) {
        const newCourse = await response.json()
        setCourses([...courses, newCourse])
        setNewCourseName("")
        setDialogOpen(false)
      } else {
        const error = await response.json()
        console.error("Error creating course:", error)
        alert(error.error || "Failed to create course")
      }
    } catch (error) {
      console.error("Error creating course:", error)
      alert("Failed to create course")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteCourse = async (courseId: number) => {
    try {
      setDeleting(courseId)
      const response = await fetch(`${backend_url}/admin/delete-course/${courseId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })

      if (response.ok) {
        setCourses(courses.filter((c) => c.id !== courseId))
        setDeleteDialogOpen(false)
        setCourseToDelete(null)
      } else {
        const error = await response.json()
        console.error("Error deleting course:", error)
        alert(error.error || "Failed to delete course")
      }
    } catch (error) {
      console.error("Error deleting course:", error)
      alert("Failed to delete course")
    } finally {
      setDeleting(null)
    }
  }

  const openDeleteDialog = (courseId: number, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCourseToDelete(courseId)
    setDeleteDialogOpen(true)
  }

  const openAssignDialog = (course: Course) => {
    setSelectedCourse(course)
    setAssignDialogOpen(true)
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
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">
            Manage all courses in the system
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Enter a name for the new course.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Course Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Mathematics, English"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !creating && newCourseName.trim()) {
                      handleCreateCourse()
                    }
                  }}
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
                onClick={handleCreateCourse}
                disabled={creating || !newCourseName.trim()}
              >
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No courses found</p>
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="relative hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openAssignDialog(course)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="pr-2">{course.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => openDeleteDialog(course.id, e)}
                    disabled={deleting === course.id}
                  >
                    {deleting === course.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              {/* <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Course ID: {course.id}
                  </p>
                </div>
              </CardContent> */}
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course
              {courseToDelete && courses.find((c) => c.id === courseToDelete) && (
                <span className="font-semibold">
                  {" "}
                  "{courses.find((c) => c.id === courseToDelete)?.name}"
                </span>
              )}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false)
                setCourseToDelete(null)
              }}
              disabled={deleting !== null}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => courseToDelete && handleDeleteCourse(courseToDelete)}
              disabled={deleting !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting !== null && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedCourse && currentBranchId && (
        <AssignCourseDialog
          open={assignDialogOpen}
          onOpenChange={(open) => {
            setAssignDialogOpen(open)
            if (!open) {
              setSelectedCourse(null)
            }
          }}
          courseId={selectedCourse.id}
          courseName={selectedCourse.name}
          currentBranchId={currentBranchId}
        />
      )}
    </div>
  )
}
