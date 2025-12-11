"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useBranch } from "@/contexts/branch-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, User, Loader2 } from "lucide-react"

interface Teacher {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: string
  branch_id: number
  created_at: Date
}

interface Class {
  id: number
  name: string
  branch_id: number
  session_id: number | null
  class_teacher_id: string | null
  created_at: Date
  updated_at: Date
  teacher_id?: string | null
  teacher_first_name?: string | null
  teacher_last_name?: string | null
  teacher_email?: string | null
}

export default function ClassesPage() {
  const { currentBranchId } = useBranch()
  const [classes, setClasses] = useState<Class[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [assigning, setAssigning] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newClassName, setNewClassName] = useState("")
  const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Fetch classes and teachers
  useEffect(() => {
    if (!currentBranchId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const [classesRes, teachersRes] = await Promise.all([
          fetch(`${backend_url}/admin/classes/${currentBranchId}`),
          fetch(`${backend_url}/admin/teachers/${currentBranchId}`),
        ])

        if (classesRes.ok) {
          const classesData = await classesRes.json()
          setClasses(classesData)
        }

        if (teachersRes.ok) {
          const teachersData = await teachersRes.json() as Teacher[]
          setTeachers(teachersData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentBranchId])

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      return
    }

    try {
      setCreating(true)
      const response = await fetch(`${backend_url}/admin/create-class?name=${newClassName.trim()}&branch_id=${currentBranchId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newClassName.trim() }),
      })

      if (response.ok) {
        const newClass = await response.json()
        setClasses([...classes, newClass])
        setNewClassName("")
        setDialogOpen(false)
      } else {
        const error = await response.json()
        console.error("Error creating class:", error)
        alert(error.error || "Failed to create class")
      }
    } catch (error) {
      console.error("Error creating class:", error)
      alert("Failed to create class")
    } finally {
      setCreating(false)
    }
  }

  const handleAssignTeacher = async (classId: number, teacherId: string | null) => {
    try {
      setAssigning(classId)
      const response = await fetch(`${backend_url}/admin/assign-teacher?class_id=${classId}&teacher_id=${teacherId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const updatedClass = await response.json()
        setClasses(classes.map((c) => 
          c.id === classId 
            ? {
                ...c,
                class_teacher_id: updatedClass.class_teacher_id,
                teacher_id: updatedClass.teacher?.id || null,
                teacher_first_name: updatedClass.teacher?.first_name || null,
                teacher_last_name: updatedClass.teacher?.last_name || null,
                teacher_email: updatedClass.teacher?.email || null,
              }
            : c
        ))
      } else {
        const error = await response.json()
        console.error("Error assigning teacher:", error)
        alert(error.error || "Failed to assign teacher")
      }
    } catch (error) {
      console.error("Error assigning teacher:", error)
      alert("Failed to assign teacher")
    } finally {
      setAssigning(null)
    }
  }

  const getTeacherInitials = (teacher: Teacher | null) => {
    if (!teacher) return "?"
    const first = teacher.first_name?.[0] || ""
    const last = teacher.last_name?.[0] || ""
    return (first + last).toUpperCase() || teacher.email[0].toUpperCase()
  }

  const getTeacherName = (teacher: Teacher | null) => {
    if (!teacher) return "No teacher"
    if (teacher.first_name || teacher.last_name) {
      return `${teacher.first_name || ""} ${teacher.last_name || ""}`.trim()
    }
    return teacher.email
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
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">
            Manage classes and assign teachers
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>
                Enter a name for the new class.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Class Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Grade 8"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !creating) {
                      handleCreateClass()
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
              <Button onClick={handleCreateClass} disabled={creating || !newClassName.trim()}>
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No classes found</p>
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first class
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classItem) => {
            const assignedTeacher = teachers.find(
              (t) => t.id === classItem.class_teacher_id
            ) || (classItem.teacher_id
              ? {
                  id: classItem.teacher_id,
                  first_name: classItem.teacher_first_name ?? null,
                  last_name: classItem.teacher_last_name ?? null,
                  email: classItem.teacher_email || "",
                  role: "teacher",
                  branch_id: classItem.branch_id,
                  created_at: new Date(),
                }
              : null)

            return (
              <Link key={classItem.id} href={`/admin/classes/${classItem.id}`}>
                <Card className="relative cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="pr-2">{classItem.name}</CardTitle>
                      <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-full"
                          disabled={assigning === classItem.id}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {assigning === classItem.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${getTeacherName(assignedTeacher)}`}
                                alt={getTeacherName(assignedTeacher)}
                              />
                              <AvatarFallback>
                                {getTeacherInitials(assignedTeacher)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" align="end">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2">
                              Assign Teacher
                            </h4>
                            <p className="text-xs text-muted-foreground mb-3">
                              Select a teacher to assign to this class
                            </p>
                          </div>
                          <Select
                            value={classItem.class_teacher_id || ""}
                            onValueChange={(value) =>
                              handleAssignTeacher(
                                classItem.id,
                                value === "none" ? null : value
                              )
                            }
                            disabled={assigning === classItem.id}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a teacher" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span>No teacher</span>
                                </div>
                              </SelectItem>
                              {teachers.map((teacher) => (
                                <SelectItem key={teacher.id} value={teacher.id}>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage
                                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${getTeacherName(teacher)}`}
                                        alt={getTeacherName(teacher)}
                                      />
                                      <AvatarFallback className="text-xs">
                                        {getTeacherInitials(teacher)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{getTeacherName(teacher)}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {assignedTeacher && (
                            <div className="pt-2 border-t">
                              <p className="text-xs text-muted-foreground mb-1">
                                Current teacher:
                              </p>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${getTeacherName(assignedTeacher)}`}
                                    alt={getTeacherName(assignedTeacher)}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {getTeacherInitials(assignedTeacher)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">
                                  {getTeacherName(assignedTeacher)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {assignedTeacher ? (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {getTeacherName(assignedTeacher)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>No teacher assigned</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
