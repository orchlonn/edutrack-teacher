"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentTeacher, logActivity } from "@/lib/db";

export async function createScheduleItem(data: {
  classId: string;
  period: number;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
}) {
  const supabase = await createClient();
  const teacher = await getCurrentTeacher();

  const { error } = await supabase.from("schedule_items").insert({
    class_id: data.classId,
    period: data.period,
    start_time: data.startTime,
    end_time: data.endTime,
    day_of_week: data.dayOfWeek,
  });

  if (error) throw new Error(error.message);

  await logActivity(teacher.id, `Added schedule item for period ${data.period}`, "system");

  revalidatePath("/schedule");
  revalidatePath("/");
}

export async function updateScheduleItem(
  id: string,
  data: {
    classId: string;
    period: number;
    startTime: string;
    endTime: string;
    dayOfWeek: number;
  },
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("schedule_items")
    .update({
      class_id: data.classId,
      period: data.period,
      start_time: data.startTime,
      end_time: data.endTime,
      day_of_week: data.dayOfWeek,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/schedule");
  revalidatePath("/");
}

export async function deleteScheduleItem(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("schedule_items")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/schedule");
  revalidatePath("/");
}
