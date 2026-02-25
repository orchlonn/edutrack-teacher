"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentTeacher } from "@/lib/db";

export async function createClass(data: {
  name: string;
  subject: string;
  grade: string;
  room: string;
}) {
  const supabase = await createClient();
  const teacher = await getCurrentTeacher();

  const { error } = await supabase.from("classes").insert({
    teacher_id: teacher.id,
    name: data.name,
    subject: data.subject,
    grade: data.grade,
    room: data.room,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/classes");
  revalidatePath("/");
}

export async function updateClass(
  classId: string,
  data: { name: string; subject: string; grade: string; room: string }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("classes")
    .update({
      name: data.name,
      subject: data.subject,
      grade: data.grade,
      room: data.room,
    })
    .eq("id", classId);

  if (error) throw new Error(error.message);

  revalidatePath("/classes");
  revalidatePath("/");
}

export async function deleteClass(classId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("classes")
    .delete()
    .eq("id", classId);

  if (error) throw new Error(error.message);

  revalidatePath("/classes");
  revalidatePath("/");
}

export async function addStudentToClass(classId: string, studentId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("class_students").upsert(
    { class_id: classId, student_id: studentId },
    { onConflict: "class_id,student_id" }
  );

  if (error) throw new Error(error.message);

  revalidatePath("/classes");
  revalidatePath("/students");
}

export async function removeStudentFromClass(
  classId: string,
  studentId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("class_students")
    .delete()
    .eq("class_id", classId)
    .eq("student_id", studentId);

  if (error) throw new Error(error.message);

  revalidatePath("/classes");
  revalidatePath("/students");
}

export async function createStudent(data: {
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
}) {
  const supabase = await createClient();

  const { data: student, error } = await supabase
    .from("students")
    .insert({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      grade: data.grade,
      parent_name: data.parentName,
      parent_phone: data.parentPhone,
      parent_email: data.parentEmail,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/classes");
  revalidatePath("/students");

  return student.id as string;
}
