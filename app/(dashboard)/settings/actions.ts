"use server";

import { createClient } from "@/lib/supabase/server";

type ActionState = { error?: string; success?: boolean } | undefined;

export async function updateProfile(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const fullName = formData.get("full_name") as string;

  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePassword(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (newPassword !== confirmPassword) {
    return { error: "새 비밀번호가 일치하지 않아요." };
  }
  if (newPassword.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 해요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) return { error: error.message };
  return { success: true };
}
