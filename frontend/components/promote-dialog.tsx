"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
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

export function PromoteDialog({
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
            `${backend_url}/admin/classes/${currentBranchId}`
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
        `${backend_url}/admin/promote/${selectedClassId}`,
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
