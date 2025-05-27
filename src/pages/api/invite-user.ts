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
    const { error: insertError } = await supabaseAdmin
      .from("users")
      .insert([{ email, full_name: name, role, is_active: false }]);
    if (insertError) {
      return res.status(400).json({ error: insertError.message });
    }
  }

  return res.status(200).json({ success: true });
}
