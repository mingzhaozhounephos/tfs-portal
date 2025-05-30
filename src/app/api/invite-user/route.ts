import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service_role key here (never expose to client)
);

export async function POST(request: Request) {
  try {
    const { email, name, role } = await request.json();

    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { name, role, from_invitation: true },
      redirectTo: `${request.headers.get("origin")}/auth/callback`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Insert user record only if not already exists
    const { data: existingUser, error: selectError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!existingUser) {
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from("users")
        .insert([{ email, full_name: name, is_active: false }])
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 400 });
      }

      // Create user role record
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert([{ user: newUser.id, role }]);

      if (roleError) {
        return NextResponse.json({ error: roleError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 