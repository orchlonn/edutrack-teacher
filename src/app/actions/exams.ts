"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentTeacher, logActivity } from "@/lib/db";

export async function createExam(data: {
  classId: string;
  name: string;
  date: string;
  maxScore: number;
  type: string;
}) {
  const supabase = await createClient();
  const teacher = await getCurrentTeacher();

  const { error } = await supabase.from("exams").insert({
    class_id: data.classId,
    name: data.name,
    date: data.date,
    max_score: data.maxScore,
    type: data.type,
  });

  if (error) throw new Error(error.message);

  await logActivity(teacher.id, `Created exam "${data.name}"`, "grade");

  revalidatePath("/grades");
  revalidatePath("/");
}

export async function updateExam(
  examId: string,
  data: {
    name: string;
    date: string;
    maxScore: number;
    type: string;
  },
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("exams")
    .update({
      name: data.name,
      date: data.date,
      max_score: data.maxScore,
      type: data.type,
    })
    .eq("id", examId);

  if (error) throw new Error(error.message);

  revalidatePath("/grades");
  revalidatePath("/");
}

export async function deleteExam(examId: string) {
  const supabase = await createClient();
  const teacher = await getCurrentTeacher();

  const { data: exam } = await supabase
    .from("exams")
    .select("name")
    .eq("id", examId)
    .single();

  const { error } = await supabase
    .from("exams")
    .delete()
    .eq("id", examId);

  if (error) throw new Error(error.message);

  await logActivity(teacher.id, `Deleted exam "${exam?.name ?? "unknown"}"`, "grade");

  revalidatePath("/grades");
  revalidatePath("/");
}
