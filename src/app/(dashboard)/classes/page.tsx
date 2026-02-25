import { getClasses, getStudents } from "@/lib/db";
import { ClassesClient } from "@/components/classes/classes-client";

export default async function ClassesPage() {
  const [classes, students] = await Promise.all([
    getClasses(),
    getStudents(),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <ClassesClient classes={classes} students={students} />
    </div>
  );
}
