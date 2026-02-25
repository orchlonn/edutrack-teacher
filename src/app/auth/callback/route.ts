import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure a teacher record exists (created during signup, but this is a fallback)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: existing } = await supabase
          .from("teachers")
          .select("id")
          .eq("auth_id", user.id)
          .single();

        if (!existing) {
          const meta = user.user_metadata ?? {};
          await supabase.from("teachers").insert({
            auth_id: user.id,
            name: meta.name || user.email?.split("@")[0] || "Teacher",
            email: user.email!,
            subject: meta.subject || "General",
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
