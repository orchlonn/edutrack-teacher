import { getTeacherByIdAdmin, getTeacherStats, getTeacherDetailStats } from "@/lib/db";
import { TeacherProfile } from "@/components/teachers/teacher-profile";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TeacherProfilePage({ params }: Props) {
  const { id } = await params;
  const teacher = await getTeacherByIdAdmin(id);

  if (!teacher) {
    notFound();
  }

  const [summary, detail] = await Promise.all([
    getTeacherStats(teacher.id),
    getTeacherDetailStats(teacher.id),
  ]);

  return (
    <TeacherProfile teacher={teacher} summary={summary} detail={detail} />
  );
}
