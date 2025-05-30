import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service_role key here (never expose to client)
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, name, role } = req.body;

  const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { name, role, from_invitation: true },
    redirectTo: `${req.headers.origin}/auth/callback`,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
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
      return res.status(400).json({ error: insertError.message });
    }

    // Create user role record
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert([{ user: newUser.id, role }]);

    if (roleError) {
      return res.status(400).json({ error: roleError.message });
    }
  }

  return res.status(200).json({ success: true });
}
