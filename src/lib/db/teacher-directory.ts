import { createAdminClient } from "@/lib/supabase/admin";
import type { Teacher } from "@/lib/types";

function mapTeacherRow(row: Record<string, unknown>): Teacher {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    subject: row.subject as string,
    avatar: (row.avatar_url as string) ?? undefined,
  };
}

// ─── List & Lookup ──────────────────────────────────

export async function getAllTeachers(): Promise<Teacher[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .order("name");

  if (error) throw error;
  return (data ?? []).map(mapTeacherRow);
}

export async function getTeacherByIdAdmin(id: string): Promise<Teacher | undefined> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;
  return mapTeacherRow(data);
}

// ─── Summary Stats (for list page) ─────────────────

export interface TeacherSummaryStats {
  classCount: number;
  studentCount: number;
  avgGrade: number | null;
  attendanceRate: number;
  examCount: number;
}

export async function getTeacherStats(teacherId: string): Promise<TeacherSummaryStats> {
  const supabase = createAdminClient();

  // Get classes for this teacher
  const { data: classes } = await supabase
    .from("classes")
    .select("id")
    .eq("teacher_id", teacherId);

  const classIds = (classes ?? []).map((c) => c.id as string);
  const classCount = classIds.length;

  if (classCount === 0) {
    return { classCount: 0, studentCount: 0, avgGrade: null, attendanceRate: 100, examCount: 0 };
  }

  // Student count (unique across classes)
  const { data: classStudents } = await supabase
    .from("class_students")
    .select("student_id")
    .in("class_id", classIds);

  const uniqueStudentIds = new Set((classStudents ?? []).map((cs) => cs.student_id as string));
  const studentCount = uniqueStudentIds.size;

  // Exam count
  const { count: examCount } = await supabase
    .from("exams")
    .select("id", { count: "exact", head: true })
    .in("class_id", classIds);

  // Average grade across all published grade entries
  const { data: gradeData } = await supabase
    .from("grade_entries")
    .select("score, exams(max_score)")
    .in("class_id", classIds)
    .eq("is_published", true)
    .not("score", "is", null);

  let avgGrade: number | null = null;
  if (gradeData && gradeData.length > 0) {
    let totalPct = 0;
    for (const entry of gradeData) {
      const exam = entry.exams as unknown as { max_score: number };
      totalPct += ((entry.score as number) / exam.max_score) * 100;
    }
    avgGrade = Math.round(totalPct / gradeData.length);
  }

  // Attendance rate across all classes
  const { data: attendanceData } = await supabase
    .from("attendance_records")
    .select("status")
    .in("class_id", classIds);

  let attendanceRate = 100;
  if (attendanceData && attendanceData.length > 0) {
    const present = attendanceData.filter(
      (r) => r.status === "present" || r.status === "late"
    ).length;
    attendanceRate = Math.round((present / attendanceData.length) * 100);
  }

  return {
    classCount,
    studentCount,
    avgGrade,
    attendanceRate,
    examCount: examCount ?? 0,
  };
}

// ─── Detailed Stats (for profile page) ─────────────

export interface ClassBreakdown {
  id: string;
  name: string;
  subject: string;
  grade: string;
  studentCount: number;
  avgGrade: number | null;
  attendanceRate: number;
}

export interface AtRiskStudent {
  id: string;
  firstName: string;
  lastName: string;
  avgGrade: number | null;
  attendanceRate: number;
  className: string;
}

export interface TeacherDetailStats {
  classes: ClassBreakdown[];
  gradeDistribution: { A: number; B: number; C: number; D: number; F: number };
  atRiskStudents: AtRiskStudent[];
  totalExams: number;
  totalStudents: number;
}

export async function getTeacherDetailStats(teacherId: string): Promise<TeacherDetailStats> {
  const supabase = createAdminClient();

  // Get teacher's classes with students
  const { data: classesData } = await supabase
    .from("classes")
    .select("*, class_students(student_id)")
    .eq("teacher_id", teacherId)
    .order("name");

  const classes = classesData ?? [];
  const allClassIds = classes.map((c) => c.id as string);

  // Exam count
  const { count: totalExams } = await supabase
    .from("exams")
    .select("id", { count: "exact", head: true })
    .in("class_id", allClassIds.length > 0 ? allClassIds : ["_none_"]);

  // All unique student IDs
  const allStudentIds = new Set<string>();
  for (const cls of classes) {
    for (const cs of (cls.class_students ?? []) as { student_id: string }[]) {
      allStudentIds.add(cs.student_id);
    }
  }

  // Fetch all grade entries + attendance for these classes in bulk
  const { data: allGrades } = allClassIds.length > 0
    ? await supabase
        .from("grade_entries")
        .select("student_id, class_id, score, exams(max_score)")
        .in("class_id", allClassIds)
        .eq("is_published", true)
        .not("score", "is", null)
    : { data: [] };

  const { data: allAttendance } = allClassIds.length > 0
    ? await supabase
        .from("attendance_records")
        .select("student_id, class_id, status")
        .in("class_id", allClassIds)
    : { data: [] };

  // Helper: compute avg grade for a student in a set of classes
  function computeStudentAvg(studentId: string, classId?: string): number | null {
    const entries = (allGrades ?? []).filter(
      (g) => g.student_id === studentId && (!classId || g.class_id === classId)
    );
    if (entries.length === 0) return null;
    let total = 0;
    for (const e of entries) {
      const exam = e.exams as unknown as { max_score: number };
      total += ((e.score as number) / exam.max_score) * 100;
    }
    return Math.round(total / entries.length);
  }

  // Helper: compute attendance rate for a student
  function computeStudentAttendance(studentId: string, classId?: string): number {
    const records = (allAttendance ?? []).filter(
      (a) => a.student_id === studentId && (!classId || a.class_id === classId)
    );
    if (records.length === 0) return 100;
    const present = records.filter((r) => r.status === "present" || r.status === "late").length;
    return Math.round((present / records.length) * 100);
  }

  // Per-class breakdown
  const classBreakdowns: ClassBreakdown[] = classes.map((cls) => {
    const studentIds = ((cls.class_students ?? []) as { student_id: string }[]).map((cs) => cs.student_id);
    const classGrades = (allGrades ?? []).filter((g) => g.class_id === cls.id);
    const classAttendance = (allAttendance ?? []).filter((a) => a.class_id === cls.id);

    let avgGrade: number | null = null;
    if (classGrades.length > 0) {
      let total = 0;
      for (const e of classGrades) {
        const exam = e.exams as unknown as { max_score: number };
        total += ((e.score as number) / exam.max_score) * 100;
      }
      avgGrade = Math.round(total / classGrades.length);
    }

    let attendanceRate = 100;
    if (classAttendance.length > 0) {
      const present = classAttendance.filter((r) => r.status === "present" || r.status === "late").length;
      attendanceRate = Math.round((present / classAttendance.length) * 100);
    }

    return {
      id: cls.id as string,
      name: cls.name as string,
      subject: cls.subject as string,
      grade: cls.grade as string,
      studentCount: studentIds.length,
      avgGrade,
      attendanceRate,
    };
  });

  // Grade distribution (by student average across all classes)
  const dist = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  for (const studentId of allStudentIds) {
    const avg = computeStudentAvg(studentId);
    if (avg === null) continue;
    if (avg >= 90) dist.A++;
    else if (avg >= 80) dist.B++;
    else if (avg >= 70) dist.C++;
    else if (avg >= 60) dist.D++;
    else dist.F++;
  }

  // At-risk students: grade < 65% or attendance < 80%
  // Need student names - fetch them
  const atRiskStudents: AtRiskStudent[] = [];
  if (allStudentIds.size > 0) {
    const { data: studentRows } = await supabase
      .from("students")
      .select("id, first_name, last_name")
      .in("id", [...allStudentIds]);

    const studentMap = new Map(
      (studentRows ?? []).map((s) => [s.id as string, s])
    );

    for (const studentId of allStudentIds) {
      const avg = computeStudentAvg(studentId);
      const att = computeStudentAttendance(studentId);
      if ((avg !== null && avg < 65) || att < 80) {
        const s = studentMap.get(studentId);
        // Find primary class for this student
        const studentClass = classes.find((c) =>
          ((c.class_students ?? []) as { student_id: string }[]).some((cs) => cs.student_id === studentId)
        );
        atRiskStudents.push({
          id: studentId,
          firstName: (s?.first_name as string) ?? "",
          lastName: (s?.last_name as string) ?? "",
          avgGrade: avg,
          attendanceRate: att,
          className: (studentClass?.name as string) ?? "",
        });
      }
    }

    // Sort by severity (lowest grade first)
    atRiskStudents.sort((a, b) => (a.avgGrade ?? 0) - (b.avgGrade ?? 0));
  }

  return {
    classes: classBreakdowns,
    gradeDistribution: dist,
    atRiskStudents,
    totalExams: totalExams ?? 0,
    totalStudents: allStudentIds.size,
  };
}
