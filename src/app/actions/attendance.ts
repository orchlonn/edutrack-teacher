"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentTeacher, logActivity } from "@/lib/db";

export async function saveAttendance(
  classId: string,
  date: string,
  records: { studentId: string; status: string; note?: string }[]
) {
  const supabase = await createClient();
  const teacher = await getCurrentTeacher();

  const { error } = await supabase
    .from("attendance_records")
    .upsert(
      records.map((r) => ({
        student_id: r.studentId,
        class_id: classId,
        date,
        status: r.status,
        note: r.note ?? null,
      })),
      { onConflict: "student_id,class_id,date" }
    );

  if (error) throw new Error(error.message);

  await logActivity(teacher.id, `Recorded attendance for ${records.length} students on ${date}`, "attendance");

  revalidatePath("/attendance");
  revalidatePath("/");
}
