"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentTeacher, logActivity } from "@/lib/db";

export async function sendReply(messageId: string, content: string) {
  const supabase = await createClient();
  const teacher = await getCurrentTeacher();

  // Verify this thread belongs to the current teacher
  const { data: thread } = await supabase
    .from("messages")
    .select("id")
    .eq("id", messageId)
    .eq("teacher_id", teacher.id)
    .single();

  if (!thread) throw new Error("Message thread not found");

  const { error: itemError } = await supabase
    .from("message_items")
    .insert({
      message_id: messageId,
      sender_name: teacher.name,
      content,
      is_from_teacher: true,
      sender_role: "teacher",
    });

  if (itemError) throw new Error(itemError.message);

  // Update thread metadata
  const { error: msgError } = await supabase
    .from("messages")
    .update({
      last_message_at: new Date().toISOString(),
      is_read: true,
      is_read_parent: false,
    })
    .eq("id", messageId)
    .eq("teacher_id", teacher.id);

  if (msgError) throw new Error(msgError.message);

  await logActivity(teacher.id, "Replied to a message thread", "message");

  revalidatePath("/messages");
}

export async function createMessage(data: {
  studentId: string;
  parentName: string;
  subject: string;
  content: string;
}) {
  const supabase = await createClient();
  const teacher = await getCurrentTeacher();

  const { data: message, error: msgError } = await supabase
    .from("messages")
    .insert({
      teacher_id: teacher.id,
      parent_name: data.parentName,
      student_id: data.studentId,
      subject: data.subject,
      is_read: true,
      is_read_parent: false,
      last_message_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (msgError) throw new Error(msgError.message);

  const { error: itemError } = await supabase
    .from("message_items")
    .insert({
      message_id: message.id,
      sender_name: teacher.name,
      content: data.content,
      is_from_teacher: true,
      sender_role: "teacher",
    });

  if (itemError) throw new Error(itemError.message);

  await logActivity(teacher.id, `Sent message to ${data.parentName} about "${data.subject}"`, "message");

  revalidatePath("/messages");
  revalidatePath("/");
}

export async function markMessageRead(messageId: string) {
  const supabase = await createClient();
  const teacher = await getCurrentTeacher();

  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("id", messageId)
    .eq("teacher_id", teacher.id);

  if (error) throw new Error(error.message);

  revalidatePath("/messages");
}
