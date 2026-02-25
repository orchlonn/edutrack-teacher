import { getAllTeachers, getTeacherStats } from "@/lib/db";
import { TeacherList } from "@/components/teachers/teacher-list";

export default async function TeachersPage() {
  const teachers = await getAllTeachers();

  // Pre-compute stats for each teacher
  const statsEntries = await Promise.all(
    teachers.map(async (t) => ({
      id: t.id,
      stats: await getTeacherStats(t.id),
    }))
  );

  const statsMap = Object.fromEntries(
    statsEntries.map((e) => [e.id, e.stats])
  );

  return (
    <div className="mx-auto max-w-3xl">
      <TeacherList teachers={teachers} statsMap={statsMap} />
    </div>
  );
}
