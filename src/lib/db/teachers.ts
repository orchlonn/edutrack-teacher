import { createClient } from "@/lib/supabase/server";
import type { Teacher } from "@/lib/types";

function mapRow(row: Record<string, unknown>): Teacher {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    subject: row.subject as string,
    avatar: (row.avatar_url as string) ?? undefined,
  };
}

export async function getCurrentTeacher(): Promise<Teacher> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let { data, error } = await supabase
    .from("teachers")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  // Auto-create teacher record if missing (handles users who signed up before this fix)
  if (error || !data) {
    const meta = user.user_metadata ?? {};
    const { data: created, error: insertError } = await supabase
      .from("teachers")
      .upsert(
        {
          auth_id: user.id,
          name: meta.name || user.email?.split("@")[0] || "Teacher",
          email: user.email!,
          subject: meta.subject || "General",
        },
        { onConflict: "auth_id" }
      )
      .select()
      .single();

    if (insertError || !created) throw new Error("Teacher record not found");
    data = created;
  }

  return mapRow(data);
}
