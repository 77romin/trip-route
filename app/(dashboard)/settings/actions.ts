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

export async function uploadAvatar(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const file = formData.get("avatar") as File;
  if (!file || file.size === 0) return { error: "파일을 선택해주세요." };

  if (file.size > 2 * 1024 * 1024) {
    return { error: "파일 크기는 2MB 이하여야 해요." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const allowedExts = ["jpg", "jpeg", "png", "gif", "webp"];
  if (!allowedExts.includes(ext)) {
    return { error: "jpg, png, gif, webp 파일만 업로드 가능해요." };
  }

  const filePath = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl },
  });

  if (updateError) return { error: updateError.message };
  return { url: publicUrl };
}

export async function saveAiSettings(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const provider = formData.get("ai_provider") as string;
  const apiKey = formData.get("ai_api_key") as string;

  const { error } = await supabase.auth.updateUser({
    data: { ai_provider: provider || null, ai_api_key: apiKey || null },
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
