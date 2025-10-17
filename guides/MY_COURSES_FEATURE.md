# My Courses Feature - Teacher Portal

## Overview
The "My Courses" feature allows teachers to view all courses assigned to them in a clean, card-based interface.

## Implementation Details

### 1. Database Queries (`lib/db/queries/teacher.ts`)

#### `getTeacherCourses(teacherId: string)`
Fetches all courses assigned to a specific teacher with related information:
- Course name
- Session name and ID
- Branch name and ID
- Created date

Uses joins to combine data from:
- `teacher_courses` (junction table)
- `courses`
- `sessions`
- `branches`

#### `getTeacherCourseById(teacherId: string, courseId: number)`
Fetches details for a specific course assigned to a teacher. Useful for future detail views.

### 2. API Route (`app/api/teacher/courses/route.ts`)

**Endpoint**: `GET /api/teacher/courses`

**Authentication**: Requires valid session with teacher role

**Response Format**:
```json
{
  "success": true,
  "courses": [
    {
      "id": 1,
      "name": "Mathematics",
      "sessionName": "2025",
      "sessionId": 1,
      "branchName": "Branch A",
      "branchId": 1,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses**:
- `401`: Unauthorized (no valid session)
- `403`: Access denied (not a teacher)
- `500`: Server error

### 3. Page Component (`app/teacher/courses/page.tsx`)

**Features**:
- Client-side data fetching using React hooks
- Loading states with skeleton components
- Error handling with visual feedback
- Empty state when no courses are assigned
- Responsive grid layout (1/2/3 columns)
- Card-based design matching the provided screenshot

**UI Components Used**:
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` from shadcn
- `Skeleton` for loading states
- `BookOpen` icon from lucide-react

### 4. Seed Script (`scripts/seed-courses.ts`)

**Command**: `npm run seed:courses`

**What it does**:
1. Creates a sample branch ("Branch A")
2. Creates a session for 2025
3. Finds the first teacher in the database
4. Creates 3 sample courses:
   - Additional Mathematics (Grade 9)
   - Mathematics (Grade 10)
   - Physics (Grade 11)
5. Assigns all courses to the teacher

## Testing

1. **Seed the database**:
   ```bash
   npm run seed:courses
   ```

2. **Login as a teacher**:
   - Email: `teacher@example.com`
   - Password: (your seeded password)

3. **Navigate to**: `/teacher/courses`

4. **Expected Result**: You should see 3 course cards displayed in a grid

## Database Schema Usage

**Tables involved**:
- `users` - Teacher information
- `branches` - School locations
- `sessions` - Academic years
- `courses` - Course catalog
- `teacher_courses` - Assignment junction table

**Relationships**:
- Teachers → teacher_courses → courses
- Courses → sessions (for academic year)
- Courses → branches (for location)

## Next Steps

Potential enhancements:
1. Add click functionality to view course details
2. Display number of students enrolled
3. Add filtering by session/branch
4. Show class schedules
5. Add course material management
6. Display upcoming exams
