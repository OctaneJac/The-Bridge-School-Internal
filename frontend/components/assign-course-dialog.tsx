"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, ChevronDown, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Class {
  id: number
  name: string
  branch_id: number
  session_id: number | null
  class_teacher_id: string | null
  created_at: Date
  updated_at: Date
}

interface Teacher {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: string
  branch_id: number
  created_at: Date
}

interface AssignCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: number
  courseName: string
  currentBranchId: number
}

interface ClassTeacherAssignment {
  class_id: number
  teacher_id: string | null
}

export function AssignCourseDialog({
  open,
  onOpenChange,
  courseId,
  courseName,
  currentBranchId,
}: AssignCourseDialogProps) {
  const [classes, setClasses] = useState<Class[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([])
  const [classTeacherAssignments, setClassTeacherAssignments] = useState<
    Record<number, string[]>
  >({})
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [classesPopoverOpen, setClassesPopoverOpen] = useState(false)
  const [teacherPopoversOpen, setTeacherPopoversOpen] = useState<
    Record<number, boolean>
  >({})
  const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL

  // Fetch classes, teachers, and existing assignments when dialog opens
  useEffect(() => {
    if (open && currentBranchId) {
      const fetchData = async () => {
        try {
          setLoading(true)
          const [classesRes, teachersRes, assignmentsRes] = await Promise.all([
            fetch(`${backend_url}/admin/classes/${currentBranchId}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
              },
            }),
            fetch(`${backend_url}/admin/teachers/${currentBranchId}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
              },
            }),
            fetch(`${backend_url}/admin/assign_course/${courseId}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
              },
            }),
          ])

          if (classesRes.ok) {
            const classesData = await classesRes.json()
            setClasses(classesData)
          } else {
            console.error("Error fetching classes:", classesRes.statusText)
          }

          if (teachersRes.ok) {
            const teachersData = await teachersRes.json()
            setTeachers(teachersData)
          } else {
            console.error("Error fetching teachers:", teachersRes.statusText)
          }

          // Parse existing assignments and populate state
          if (assignmentsRes.ok) {
            const assignmentsData: ClassTeacherAssignment[] = await assignmentsRes.json()
            
            // Group assignments by class_id
            const classIdsSet = new Set<number>()
            const assignmentsByClass: Record<number, string[]> = {}
            
            assignmentsData.forEach((assignment) => {
              const classId = assignment.class_id
              classIdsSet.add(classId)
              
              if (!assignmentsByClass[classId]) {
                assignmentsByClass[classId] = []
              }
              
              // Only add non-null teacher_ids
              if (assignment.teacher_id) {
                assignmentsByClass[classId].push(assignment.teacher_id)
              }
            })
            
            // Update state with existing assignments
            setSelectedClassIds(Array.from(classIdsSet))
            setClassTeacherAssignments(assignmentsByClass)
            
            console.log("Loaded existing assignments:", assignmentsByClass)
          } else {
            // If no assignments found or error, start with empty state
            console.log("No existing assignments found or error:", assignmentsRes.statusText)
            setSelectedClassIds([])
            setClassTeacherAssignments({})
          }
        } catch (error) {
          console.error("Error fetching data:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchData()
    } else {
      // Reset state when dialog closes
      setSelectedClassIds([])
      setClassTeacherAssignments({})
      setClassesPopoverOpen(false)
      setTeacherPopoversOpen({})
    }
  }, [open, currentBranchId, courseId, backend_url])

  const handleClassToggle = (classId: number) => {
    if (selectedClassIds.includes(classId)) {
      // Remove class and its teacher assignments
      setSelectedClassIds(selectedClassIds.filter((id) => id !== classId))
      const newAssignments = { ...classTeacherAssignments }
      delete newAssignments[classId]
      setClassTeacherAssignments(newAssignments)
      const newPopovers = { ...teacherPopoversOpen }
      delete newPopovers[classId]
      setTeacherPopoversOpen(newPopovers)
    } else {
      // Add class
      setSelectedClassIds([...selectedClassIds, classId])
    }
  }

  const handleTeacherToggle = (classId: number, teacherId: string) => {
    const currentTeachers = classTeacherAssignments[classId] || []
    if (currentTeachers.includes(teacherId)) {
      setClassTeacherAssignments({
        ...classTeacherAssignments,
        [classId]: currentTeachers.filter((id) => id !== teacherId),
      })
    } else {
      setClassTeacherAssignments({
        ...classTeacherAssignments,
        [classId]: [...currentTeachers, teacherId],
      })
    }
  }

  const handleAssign = async () => {
    try {
      setAssigning(true)

      // Build the assignment array
      const assignments: ClassTeacherAssignment[] = []
      
      for (const classId of selectedClassIds) {
        const teacherIds = classTeacherAssignments[classId] || []
        
        // Log teacher IDs for this class
        console.log(`Class ${classId} - Selected Teacher IDs:`, teacherIds)
        
        if (teacherIds.length > 0) {
          // Add one assignment per teacher for this class
          teacherIds.forEach((teacherId) => {
            assignments.push({
              class_id: classId,
              teacher_id: teacherId,
            })
          })
        } else {
          // If no teachers selected, still add the class with null teacher
          assignments.push({
            class_id: classId,
            teacher_id: null,
          })
        }
      }

      // Log all assignments before sending
      console.log("All assignments to send:", assignments)

      const response = await fetch(
        `${backend_url}/admin/assign_course/${courseId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(assignments),
        }
      )

      if (response.ok) {
        onOpenChange(false)
        // Reset state
        setSelectedClassIds([])
        setClassTeacherAssignments({})
        setClassesPopoverOpen(false)
        setTeacherPopoversOpen({})
      } else {
        const error = await response.json()
        console.error("Error assigning course:", error)
        alert(error.error || "Failed to assign course")
      }
    } catch (error) {
      console.error("Error assigning course:", error)
      alert("Failed to assign course")
    } finally {
      setAssigning(false)
    }
  }

  const getTeacherName = (teacher: Teacher) => {
    if (teacher.first_name || teacher.last_name) {
      return `${teacher.first_name || ""} ${teacher.last_name || ""}`.trim()
    }
    return teacher.email
  }

  const getSelectedClassesDisplay = () => {
    if (selectedClassIds.length === 0) {
      return "Select classes..."
    }
    if (selectedClassIds.length === 1) {
      const classItem = classes.find((c) => c.id === selectedClassIds[0])
      return classItem?.name || "1 class selected"
    }
    return `${selectedClassIds.length} classes selected`
  }

  const getSelectedTeachersDisplay = (classId: number) => {
    const selectedTeachers = classTeacherAssignments[classId] || []
    if (selectedTeachers.length === 0) {
      return "Select teachers..."
    }
    if (selectedTeachers.length === 1) {
      const teacher = teachers.find((t) => t.id === selectedTeachers[0])
      return getTeacherName(teacher!)
    }
    return `${selectedTeachers.length} teachers selected`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Course: {courseName}</DialogTitle>
          <DialogDescription>
            Select classes and assign teachers to this course for each class.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Classes Multi-Select */}
              <div className="space-y-2">
                <Label>Select Classes</Label>
                <Popover open={classesPopoverOpen} onOpenChange={setClassesPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      <span className="truncate">{getSelectedClassesDisplay()}</span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <div className="max-h-[300px] overflow-y-auto p-2">
                      {classes.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          No classes available
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {classes.map((classItem) => (
                            <div
                              key={classItem.id}
                              className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent"
                            >
                              <Checkbox
                                id={`class-${classItem.id}`}
                                checked={selectedClassIds.includes(classItem.id)}
                                onCheckedChange={() => handleClassToggle(classItem.id)}
                              />
                              <label
                                htmlFor={`class-${classItem.id}`}
                                className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {classItem.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                {selectedClassIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedClassIds.map((classId) => {
                      const classItem = classes.find((c) => c.id === classId)
                      return (
                        <Badge
                          key={classId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {classItem?.name || `Class ${classId}`}
                          <button
                            onClick={() => handleClassToggle(classId)}
                            className="ml-1 rounded-full hover:bg-secondary-foreground/20"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Teacher Assignments for Selected Classes */}
              {selectedClassIds.length > 0 && (
                <div className="space-y-4">
                  <Label>Assign Teachers to Classes</Label>
                  <div className="space-y-3">
                    {selectedClassIds.map((classId) => {
                      const classItem = classes.find((c) => c.id === classId)
                      const selectedTeachers =
                        classTeacherAssignments[classId] || []
                      const isPopoverOpen = teacherPopoversOpen[classId] || false

                      return (
                        <div
                          key={classId}
                          className="flex items-center justify-between gap-4 rounded-lg border p-4"
                        >
                          {/* Class Name Label on Left */}
                          <div className="flex-shrink-0">
                            <Label className="text-base font-semibold">
                              {classItem?.name || `Class ${classId}`}
                            </Label>
                          </div>

                          {/* Teacher Multi-Select on Right */}
                          <div className="flex-1 min-w-0">
                            <Popover
                              open={isPopoverOpen}
                              onOpenChange={(open) =>
                                setTeacherPopoversOpen({
                                  ...teacherPopoversOpen,
                                  [classId]: open,
                                })
                              }
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className="w-full justify-between"
                                >
                                  <span className="truncate">
                                    {getSelectedTeachersDisplay(classId)}
                                  </span>
                                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-[300px] p-0"
                                align="end"
                                side="bottom"
                              >
                                <div className="max-h-[300px] overflow-y-auto p-2">
                                  {teachers.length === 0 ? (
                                    <p className="py-4 text-center text-sm text-muted-foreground">
                                      No teachers available
                                    </p>
                                  ) : (
                                    <div className="space-y-2">
                                      {teachers.map((teacher) => (
                                        <div
                                          key={teacher.id}
                                          className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent"
                                        >
                                          <Checkbox
                                            id={`teacher-${classId}-${teacher.id}`}
                                            checked={selectedTeachers.includes(
                                              teacher.id
                                            )}
                                            onCheckedChange={() =>
                                              handleTeacherToggle(classId, teacher.id)
                                            }
                                          />
                                          <label
                                            htmlFor={`teacher-${classId}-${teacher.id}`}
                                            className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                          >
                                            {getTeacherName(teacher)}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>
                            {selectedTeachers.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {selectedTeachers.map((teacherId) => {
                                  const teacher = teachers.find(
                                    (t) => t.id === teacherId
                                  )
                                  return (
                                    <Badge
                                      key={teacherId}
                                      variant="outline"
                                      className="flex items-center gap-1"
                                    >
                                      {getTeacherName(teacher!)}
                                      <button
                                        onClick={() =>
                                          handleTeacherToggle(classId, teacherId)
                                        }
                                        className="ml-1 rounded-full hover:bg-secondary-foreground/20"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={assigning}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={assigning || selectedClassIds.length === 0}
          >
            {assigning && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
