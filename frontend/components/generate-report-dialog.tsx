"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import jsPDF from "jspdf"

interface Exam {
  exam_id: number
  exam_name: string
}

interface SubjectMark {
  subject: string
  total: number
  received: number
  grade: string
}

interface StudentReport {
  student_id: number
  student_name: string
  exam_name: string
  total_marks: number
  date: string
  subjects: SubjectMark[]
}

interface GenerateReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedStudentIds: string[]
  classId: string
}

export function GenerateReportDialog({
  open,
  onOpenChange,
  selectedStudentIds,
  classId,
}: GenerateReportDialogProps) {
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExamIds, setSelectedExamIds] = useState<number[]>([])
  const [loadingExams, setLoadingExams] = useState(false)
  const [generating, setGenerating] = useState(false)
  const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL

  // Fetch exams when dialog opens
  useEffect(() => {
    if (open && classId) {
      const fetchExams = async () => {
        try {
          setLoadingExams(true)
          const response = await fetch(
            `${backend_url}/admin/get_all_exams/${classId}`
          )

          if (response.ok) {
            const examsData = await response.json()
            setExams(examsData)
          } else {
            console.error("Error fetching exams:", response.statusText)
          }
        } catch (error) {
          console.error("Error fetching exams:", error)
        } finally {
          setLoadingExams(false)
        }
      }

      fetchExams()
    } else {
      setSelectedExamIds([])
    }
  }, [open, classId, backend_url])

  const handleExamToggle = (examId: number) => {
    setSelectedExamIds((prev) =>
      prev.includes(examId)
        ? prev.filter((id) => id !== examId)
        : [...prev, examId]
    )
  }

  const generatePDF = (report: StudentReport) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const maxWidth = pageWidth - 2 * margin
    let yPosition = margin

    // Exam Name (Top)
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text(report.exam_name, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 15

    // Student Name
    doc.setFontSize(16)
    doc.setFont("helvetica", "normal")
    doc.text(`Student: ${report.student_name}`, margin, yPosition)
    yPosition += 15

    // Date
    doc.setFontSize(12)
    doc.text(`Date: ${report.date}`, margin, yPosition)
    yPosition += 10

    // Table headers
    const tableHeaders = ["Subject", "Total", "Received", "Grade"]
    const colWidths = [maxWidth * 0.4, maxWidth * 0.2, maxWidth * 0.2, maxWidth * 0.2]
    let xPosition = margin

    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setFillColor(200, 200, 200)
    doc.rect(xPosition, yPosition, maxWidth, 10, "F")

    tableHeaders.forEach((header, index) => {
      doc.text(header, xPosition + 2, yPosition + 7)
      xPosition += colWidths[index]
    })

    yPosition += 10

    // Table rows
    doc.setFont("helvetica", "normal")
    report.subjects.forEach((subject) => {
      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage()
        yPosition = margin
      }

      xPosition = margin
      doc.rect(xPosition, yPosition, maxWidth, 10)

      doc.text(subject.subject, xPosition + 2, yPosition + 7)
      xPosition += colWidths[0]

      doc.text(subject.total.toString(), xPosition + 2, yPosition + 7)
      xPosition += colWidths[1]

      doc.text(subject.received.toString(), xPosition + 2, yPosition + 7)
      xPosition += colWidths[2]

      doc.text(subject.grade, xPosition + 2, yPosition + 7)

      yPosition += 10
    })

    // Total marks
    yPosition += 10
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(`Total Marks: ${report.total_marks}`, margin, yPosition)

    // Save PDF
    const fileName = `${report.student_name}_${report.exam_name}_Report.pdf`
    doc.save(fileName)
  }

  const handleGenerateReport = async () => {
    if (selectedExamIds.length === 0 || selectedStudentIds.length === 0) {
      alert("Please select at least one exam and have students selected")
      return
    }

    try {
      setGenerating(true)
      const studentIds = selectedStudentIds.map((id) => parseInt(id))

      const response = await fetch(`${backend_url}/admin/generate_report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_ids: studentIds,
          exam_ids: selectedExamIds,
        }),
      })

      if (response.ok) {
        const reports: StudentReport[] = await response.json()

        // Generate PDF for each student report (separate report per exam)
        // The API returns one report per student-exam combination
        // Generate PDFs sequentially with small delays to prevent browser blocking multiple downloads
        for (let i = 0; i < reports.length; i++) {
          if (i > 0) {
            // Add a small delay between PDF generations (except for the first one)
            await new Promise((resolve) => setTimeout(resolve, 300))
          }
          generatePDF(reports[i])
        }

        onOpenChange(false)
        setSelectedExamIds([])
      } else {
        const error = await response.json()
        console.error("Error generating report:", error)
        alert(error.error || "Failed to generate report")
      }
    } catch (error) {
      console.error("Error generating report:", error)
      alert("Failed to generate report")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
          <DialogDescription>
            Select exams to generate reports for {selectedStudentIds.length} selected student(s).
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {loadingExams ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : exams.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No exams available for this class.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Exams</Label>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  <div className="space-y-3">
                    {exams.map((exam) => (
                      <div
                        key={exam.exam_id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`exam-${exam.exam_id}`}
                          checked={selectedExamIds.includes(exam.exam_id)}
                          onCheckedChange={() => handleExamToggle(exam.exam_id)}
                        />
                        <label
                          htmlFor={`exam-${exam.exam_id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {exam.exam_name}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              {selectedExamIds.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedExamIds.length} exam(s) selected. PDF reports will be generated for each student.
                </p>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={generating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerateReport}
            disabled={generating || selectedExamIds.length === 0 || loadingExams}
          >
            {generating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Generate Reports
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
