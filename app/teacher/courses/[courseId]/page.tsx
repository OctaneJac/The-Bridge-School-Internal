"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Save, Filter } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { createGradeColumns, type StudentGradeRow } from "@/components/tables/columns/grade-columns";
import { fetchCourseData, createExamAction, saveGradesAction } from "../../actions";

interface Exam {
  id: number;
  name: string;
  maxMarks: number;
}

interface Student {
  studentId: number;
  studentName: string;
}

interface Grade {
  examId: number;
  studentId: number;
  marksObtained: number;
  gradeId: number;
}

interface CourseData {
  students: Student[];
  exams: Exam[];
  grades: Grade[];
  courseInfo: {
    id: number;
    name: string;
    sessionName: string | null;
    className: string | null;
  } | null;
}

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [gradeChanges, setGradeChanges] = useState<Map<string, { examId: number; studentId: number; marks: number | null }>>(new Map());
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);
  const [visibleExamIds, setVisibleExamIds] = useState<Set<number>>(new Set());
  const [examForm, setExamForm] = useState({
    name: "",
    maxMarks: "",
  });

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  // Initialize visible exams when data is loaded
  useEffect(() => {
    if (courseData?.exams) {
      setVisibleExamIds(new Set(courseData.exams.map(e => e.id)));
    }
  }, [courseData?.exams]);

  async function loadCourseData() {
    try {
      const data = await fetchCourseData(parseInt(courseId));
      setCourseData({
        students: data.students,
        exams: data.exams,
        grades: data.grades,
        courseInfo: data.courseInfo,
      });
    } catch (error) {
      toast.error("Failed to load course data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleGradeChange = (studentId: number, examId: number, marks: number | null) => {
    const key = `${studentId}-${examId}`;
    const newChanges = new Map(gradeChanges);
    
    if (marks === null) {
      newChanges.delete(key);
    } else {
      newChanges.set(key, { examId, studentId, marks });
    }
    
    setGradeChanges(newChanges);

    // Also update local state for immediate UI feedback
    if (courseData) {
      const updatedGrades = [...courseData.grades];
      const existingGradeIndex = updatedGrades.findIndex(
        g => g.studentId === studentId && g.examId === examId
      );

      if (existingGradeIndex >= 0 && marks !== null) {
        updatedGrades[existingGradeIndex].marksObtained = marks;
      } else if (marks !== null) {
        updatedGrades.push({
          examId,
          studentId,
          marksObtained: marks,
          gradeId: -1, // Temporary ID for new grades
        });
      }

      setCourseData({
        ...courseData,
        grades: updatedGrades,
      });
    }
  };

  const handleSaveGrades = async () => {
    if (gradeChanges.size === 0) {
      toast.info("No changes to save");
      return;
    }

    setSaving(true);
    try {
      const gradesToSave = Array.from(gradeChanges.values())
        .filter(change => change.marks !== null)
        .map(change => ({
          examId: change.examId,
          studentId: change.studentId,
          marksObtained: change.marks!,
        }));

      await saveGradesAction(gradesToSave);
      
      toast.success(`Successfully saved ${gradeChanges.size} grade(s)`);
      setGradeChanges(new Map());
      
      // Refresh data
      await loadCourseData();
    } catch (error) {
      toast.error("Failed to save grades");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateExam = async () => {
    if (!examForm.name || !examForm.maxMarks) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!courseData?.courseInfo) {
      toast.error("Course information not available");
      return;
    }

    try {
      await createExamAction({
        courseId: parseInt(courseId),
        sessionId: 1,
        name: examForm.name,
        maxMarks: parseInt(examForm.maxMarks),
      });

      toast.success("Exam created successfully");
      setIsExamDialogOpen(false);
      setExamForm({ name: "", maxMarks: "" });
      
      // Refresh data
      await loadCourseData();
    } catch (error) {
      toast.error("Failed to create exam");
      console.error(error);
    }
  };

  const toggleExamVisibility = (examId: number) => {
    setVisibleExamIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(examId)) {
        newSet.delete(examId);
      } else {
        newSet.add(examId);
      }
      return newSet;
    });
  };

  const toggleAllExams = () => {
    if (visibleExamIds.size === courseData?.exams.length) {
      setVisibleExamIds(new Set());
    } else {
      setVisibleExamIds(new Set(courseData?.exams.map(e => e.id) || []));
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-96 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive font-medium">Failed to load course data</p>
        </div>
      </div>
    );
  }

  // Transform data for the table
  const tableData: StudentGradeRow[] = courseData.students.map((student) => ({
    studentId: student.studentId,
    studentName: student.studentName,
    exams: courseData.exams.map((exam) => {
      const grade = courseData.grades.find(
        (g) => g.studentId === student.studentId && g.examId === exam.id
      );
      return {
        examId: exam.id,
        examName: exam.name,
        maxMarks: exam.maxMarks,
        marksObtained: grade?.marksObtained ?? null,
      };
    }),
  }));

  const columns = createGradeColumns(courseData.exams, handleGradeChange, visibleExamIds);

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {courseData.courseInfo?.name || "Course"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {courseData.courseInfo?.className || "Grade"} - {courseData.courseInfo?.sessionName || "2025"}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Exams ({visibleExamIds.size}/{courseData.exams.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter Exams</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={visibleExamIds.size === courseData.exams.length}
                  onCheckedChange={toggleAllExams}
                >
                  <span className="font-medium">All Exams</span>
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {courseData.exams.map((exam) => (
                  <DropdownMenuCheckboxItem
                    key={exam.id}
                    checked={visibleExamIds.has(exam.id)}
                    onCheckedChange={() => toggleExamVisibility(exam.id)}
                  >
                    {exam.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Exam
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add new exam</DialogTitle>
                  <DialogDescription>
                    Create a new exam for this course
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="exam-name">Exam Name</Label>
                    <Input
                      id="exam-name"
                      placeholder="e.g., Midterm, Final"
                      value={examForm.name}
                      onChange={(e) =>
                        setExamForm({ ...examForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-marks">Total Marks</Label>
                    <Input
                      id="max-marks"
                      type="number"
                      placeholder="100"
                      value={examForm.maxMarks}
                      onChange={(e) =>
                        setExamForm({ ...examForm, maxMarks: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsExamDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateExam}>Create Exam</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button
              onClick={handleSaveGrades}
              disabled={gradeChanges.size === 0 || saving}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : `Save${gradeChanges.size > 0 ? ` (${gradeChanges.size})` : ""}`}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-6">
        <DataTable
          columns={columns}
          data={tableData}
          filterColumn="studentName"
          filterPlaceholder="Filter Students"
        />
      </div>
    </div>
  );
}
