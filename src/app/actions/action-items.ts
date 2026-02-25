"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentTeacher, logActivity } from "@/lib/db";

export async function toggleActionItem(id: string, isCompleted: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("action_items")
    .update({ is_completed: isCompleted })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function createActionItem(data: {
  title: string;
  type: "attendance" | "grades" | "message" | "alert";
  priority: "high" | "medium" | "low";
  link: string;
}) {
  const supabase = await createClient();
  const teacher = await getCurrentTeacher();

  const { error } = await supabase.from("action_items").insert({
    teacher_id: teacher.id,
    title: data.title,
    type: data.type,
    priority: data.priority,
    link: data.link,
  });

  if (error) throw new Error(error.message);

  await logActivity(teacher.id, `Created action item: "${data.title}"`, "system");

  revalidatePath("/");
}
