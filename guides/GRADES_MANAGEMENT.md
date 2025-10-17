# Course Grades Management - Teacher Portal

## Overview
The Course Grades Management feature allows teachers to view students enrolled in their courses, manage exams, and input/update student grades with a dynamic, filterable table interface.

## Implementation Details

### Architecture: Server Actions vs API Routes

This implementation uses **Next.js Server Actions** instead of traditional API routes for several advantages:

**Benefits of Server Actions:**
- ✅ Direct database access without HTTP overhead
- ✅ Automatic request deduplication
- ✅ Progressive enhancement support
- ✅ Type-safe by default
- ✅ Simpler error handling
- ✅ Better performance (no serialization/deserialization)

### 1. Server Actions (`app/teacher/actions.ts`)

#### `fetchCourseData(courseId: number)`
Fetches complete course information including:
- Course details (name, session, class)
- All enrolled students
- All exams for the course
- All grades for students

**Authentication**: Requires teacher role

**Returns**:
```typescript
{
  courseInfo: {
    id: number;
    name: string;
    sessionName: string | null;
    className: string | null;
  };
  students: Array<{ studentId: number; studentName: string }>;
  exams: Array<{ id: number; name: string; maxMarks: number }>;
  grades: Array<{ examId: number; studentId: number; marksObtained: number; gradeId: number }>;
}
```

#### `createExamAction({ courseId, sessionId, name, maxMarks })`
Creates a new exam for a course.

**Authentication**: Requires teacher role

#### `saveGradesAction(grades: Array<{...}>)`
Batch saves/updates multiple student grades.

**Authentication**: Requires teacher role

**Optimizations**:
- Uses `Promise.all` for parallel grade updates
- Supports upsert (insert or update)

#### `fetchTeacherCourses()`
Fetches all courses assigned to the logged-in teacher.

**Authentication**: Requires teacher role

### 2. Database Queries (`lib/db/queries/teacher.ts`)

#### `getCourseStudentsWithGrades(teacherId, courseId)`
Complex query that:
1. Verifies teacher has access to the course
2. Joins multiple tables to get students enrolled in classes taking this course
3. Fetches all exams and grades for the course

**Tables joined**:
- `teacher_courses` → verify access
- `students` → `student_classes` → `classes` → `class_courses` → get enrolled students
- `exams` → get course exams
- `grades` → get student grades

#### `createExam({ courseId, sessionId, name, maxMarks })`
Inserts a new exam record.

#### `upsertGrade({ examId, studentId, marksObtained })`
Updates existing grade or creates new one:
- Checks if grade exists for student + exam combination
- Updates if exists, inserts if new

### 3. Dynamic Column System (`components/tables/columns/grade-columns.tsx`)

**Key Features**:
- ✅ **Dynamic exam columns**: Columns generated based on available exams
- ✅ **Filterable exams**: Only show selected exams via `visibleExamIds` Set
- ✅ **Editable marks**: Input fields for each student-exam combination
- ✅ **Max marks display**: Shows max marks for each exam
- ✅ **Auto-calculated summaries**: Total marks and performance badges
- ✅ **Performance indicators**: High/Medium/Low badges with arrows

**Column Structure**:
1. Checkbox (select row)
2. Student Name (sortable)
3. Dynamic Exam Columns (one per visible exam)
4. Grades Summary (total/max)
5. Performance Badge (based on percentage)

**Grade Input Features**:
```tsx
<Input
  type="number"
  min="0"
  max={maxMarks}
  value={marks ?? ""}
  placeholder="--"  // Shows when no grade entered
  onChange={...}
/>
<span>/{maxMarks}</span>  // Shows max marks
```

### 4. Course Detail Page (`app/teacher/courses/[courseId]/page.tsx`)

**State Management**:
- `courseData`: All course information
- `gradeChanges`: Map of pending changes (not yet saved)
- `visibleExamIds`: Set of exam IDs to display
- `isExamDialogOpen`: Dialog state for creating exams

**Features**:

#### Exam Filtering
```tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    Exams ({visibleExamIds.size}/{totalExams})
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuCheckboxItem>All Exams</DropdownMenuCheckboxItem>
    {exams.map(exam => (
      <DropdownMenuCheckboxItem>
        {exam.name}
      </DropdownMenuCheckboxItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

**Benefits**:
- View only relevant exams
- Reduce visual clutter
- Focus on specific assessment periods
- Performance indicators only calculate for visible exams

#### Grade Change Tracking
Changes are tracked locally before saving:
```typescript
const gradeChanges = new Map<string, {
  examId: number;
  studentId: number;
  marks: number | null;
}>();
```

**Key**: `"${studentId}-${examId}"`

**Save Button**:
- Shows count of pending changes
- Disabled when no changes
- Shows loading state during save
- Batch saves all changes at once

#### Create Exam Dialog
```tsx
<Dialog>
  <DialogContent>
    <Input placeholder="e.g., Midterm, Final" />
    <Input type="number" placeholder="100" />
  </DialogContent>
</Dialog>
```

### 5. Data Flow

```
User Action → Server Action → Drizzle Query → Database
     ↓
Toast Notification
     ↓
Refresh Data → Update UI
```

**Example: Saving Grades**
1. User edits grades in input fields
2. Changes stored in local `gradeChanges` Map
3. User clicks "Save" button
4. `saveGradesAction()` called with all changes
5. Server validates user is a teacher
6. `upsertGrade()` called for each change in parallel
7. Success toast shown
8. `loadCourseData()` refreshes all data
9. UI updates with latest grades

### 6. Seed Scripts

#### `seed-courses.ts`
Creates: Branch → Session → Courses → Teacher assignment

#### `seed-students.ts`
Creates: Students → Class → Enroll students → Link course to class

#### `seed-exams.ts`
Creates: Exams → Sample grades (partial data)

**Run in order**:
```bash
npm run seed:courses
npm run seed:students
npm run seed:exams
```

## UI Components Used

- `DataTable` - Main table with sorting, filtering, pagination
- `Dialog` - Create exam modal
- `DropdownMenu` - Exam filter dropdown
- `Input` - Grade entry fields
- `Badge` - Pending status, performance indicators
- `Button` - Save, Create exam, Back navigation
- `Skeleton` - Loading states
- `Toaster` (Sonner) - Success/error notifications

## Key Features

### ✅ Dynamic Exam Filtering
- Toggle individual exams on/off
- "All Exams" toggle
- Shows count of visible/total exams
- Performance calculations adjust based on visible exams

### ✅ Inline Grade Editing
- Direct input in table cells
- Visual feedback with /maxMarks display
- Placeholder "--" for missing grades
- Min/max validation

### ✅ Batch Save with Tracking
- See count of pending changes
- Save multiple grades at once
- Optimistic UI updates
- Toast notifications for feedback

### ✅ Performance Indicators
- Auto-calculated based on total marks
- High (≥80%) - Green badge with up arrow
- Medium (≥60%) - Yellow badge with right arrow
- Low (<60%) - Red badge with down arrow

### ✅ Responsive Design
- Works on mobile/tablet/desktop
- Horizontal scroll for many exams
- Sticky columns for student names

## Testing

1. **Login as teacher**: `teacher@example.com`
2. **Navigate to**: My Courses
3. **Click**: "Additional Mathematics" card
4. **See**: Table with 10 students, 2 exams (Midterm, Final)
5. **Filter**: Click "Exams" dropdown, toggle exams on/off
6. **Edit**: Enter marks in input fields
7. **Save**: Click "Save" button
8. **Create Exam**: Click "+ Exam" button
9. **Verify**: Check toasts for success/error messages

## Performance Optimizations

1. **Server Actions**: Direct DB access, no HTTP overhead
2. **Batch Operations**: Parallel grade saves with `Promise.all`
3. **Local State**: Changes tracked locally before save
4. **Optimistic Updates**: UI updates immediately for better UX
5. **Conditional Rendering**: Only render visible exam columns
6. **Memoization**: Column definitions recalculated only when exams change

## Future Enhancements

- [ ] Bulk grade import from CSV
- [ ] Grade history/audit log
- [ ] Comments on grades
- [ ] Grade curves and statistics
- [ ] Export grades to PDF
- [ ] Email grade notifications to students
- [ ] Grade locks (prevent editing after deadline)
- [ ] Weighted grade calculations
- [ ] Custom performance thresholds
