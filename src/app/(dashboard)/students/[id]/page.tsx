import { StudentProfile } from "@/components/students/student-profile";
import { getStudentById, students } from "@/lib/mock-data";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return students.map((s) => ({ id: s.id }));
}

export default async function StudentProfilePage({ params }: Props) {
  const { id } = await params;
  const student = getStudentById(id);

  if (!student) {
    notFound();
  }

  return <StudentProfile student={student} />;
}
