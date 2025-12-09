"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown, ArrowRight } from "lucide-react";

export type GradeRow = {
  id: string; // Unique ID for the row (studentId-examId)
  studentId: number;
  studentName: string;
  examId: number;
  examName: string;
  examTotalMarks: number;
  examDate: string | null;
  studentMarks: number | null;
};

export const createGradeColumns = (
  onGradeChange: (studentId: number, examId: number, marks: number | null) => void
): ColumnDef<GradeRow>[] => {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "studentName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Student Name" />
      ),
      cell: ({ row }) => {
        const name = row.getValue("studentName") as string;
        return <div className="font-medium">{name}</div>;
      },
      enableSorting: true,
    },
    {
      accessorKey: "examName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Exam Name" />
      ),
      cell: ({ row }) => {
        const name = row.getValue("examName") as string;
        return <div className="font-medium">{name}</div>;
      },
      enableSorting: true,
    },
    {
      accessorKey: "examTotalMarks",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Marks" />
      ),
      cell: ({ row }) => {
        const marks = row.getValue("examTotalMarks") as number;
        return <div className="font-mono tabular-nums">{marks}</div>;
      },
      enableSorting: true,
    },
    {
      accessorKey: "examDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("examDate") as string | null;
        if (!date) {
          return <span className="text-muted-foreground text-sm">--</span>;
        }
        return (
          <div className="text-sm">
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "studentMarks",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Student Marks" />
      ),
      cell: ({ row }) => {
        const marks = row.getValue("studentMarks") as number | null;
        const maxMarks = row.original.examTotalMarks;
        const studentId = row.original.studentId;
        const examId = row.original.examId;

        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max={maxMarks}
              value={marks ?? ""}
              placeholder="--"
              onChange={(e) => {
                const value = e.target.value;
                onGradeChange(
                  studentId,
                  examId,
                  value === "" ? null : parseInt(value)
                );
              }}
              className="w-24 h-8"
            />
            <span className="text-xs text-muted-foreground">/ {maxMarks}</span>
          </div>
        );
      },
      enableSorting: true,
    },
    {
      id: "performance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Performance" />
      ),
      cell: ({ row }) => {
        const marks = row.original.studentMarks;
        const maxMarks = row.original.examTotalMarks;

        if (marks === null) {
          return (
            <Badge variant="secondary" className="text-xs">
              Pending
            </Badge>
          );
        }

        const percentage = (marks / maxMarks) * 100;

        let variant: "default" | "secondary" | "destructive" = "destructive";
        let label = "Low";
        let Icon = ArrowDown;

        if (percentage >= 80) {
          variant = "default";
          label = "High";
          Icon = ArrowUp;
        } else if (percentage >= 60) {
          variant = "secondary";
          label = "Medium";
          Icon = ArrowRight;
        }

        return (
          <Badge variant={variant} className="gap-1">
            <Icon className="h-3 w-3" />
            {label}
          </Badge>
        );
      },
      enableSorting: true,
    },
  ];
};


