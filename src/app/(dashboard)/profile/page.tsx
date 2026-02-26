import {
  getCurrentTeacher,
  getClasses,
  getStudents,
  getAllAttendanceRecords,
  getStudentAverageGrade,
  getStudentAttendanceRate,
  getActivities,
} from "@/lib/db";
import { ProfileClient } from "@/components/profile/profile-client";

export default async function ProfilePage() {
  const [teacher, classes, students, attendanceRecords, activities] =
    await Promise.all([
      getCurrentTeacher(),
      getClasses(),
      getStudents(),
      getAllAttendanceRecords(),
      getActivities(),
    ]);

  // Compute performance stats
  const totalClasses = classes.length;
  const allStudentIds = new Set(classes.flatMap((c) => c.studentIds));
  const totalStudents = allStudentIds.size;

  // Overall attendance rate
  const totalRecords = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(
    (r) => r.status === "present"
  ).length;
  const attendanceRate =
    totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

  // Overall class average
  const studentAverages = await Promise.all(
    [...allStudentIds].map((id) => getStudentAverageGrade(id))
  );
  const validAverages = studentAverages.filter(
    (avg): avg is number => avg !== null
  );
  const classAverage =
    validAverages.length > 0
      ? Math.round(
          validAverages.reduce((sum, avg) => sum + avg, 0) /
            validAverages.length
        )
      : null;

  // Student attendance rates for at-risk count
  const studentAttendanceRates = await Promise.all(
    [...allStudentIds].map(async (id) => ({
      id,
      rate: await getStudentAttendanceRate(id),
      avg: studentAverages[[...allStudentIds].indexOf(id)],
    }))
  );
  const atRiskCount = studentAttendanceRates.filter(
    (s) => (s.avg !== null && s.avg < 65) || s.rate < 80
  ).length;

  // Exams graded (count unique dates with attendance)
  const uniqueAttendanceDays = new Set(attendanceRecords.map((r) => r.date))
    .size;

  return (
    <ProfileClient
      teacher={teacher}
      stats={{
        totalClasses,
        totalStudents,
        attendanceRate,
        classAverage,
        atRiskCount,
        activeDays: uniqueAttendanceDays,
        recentActivities: activities.length,
      }}
    />
  );
}
