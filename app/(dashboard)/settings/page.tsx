import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import SettingsForm from "./SettingsForm";

export const metadata: Metadata = {
  title: "설정 — TripRoute",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? "";
  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? "";
  const avatarUrl = (user?.user_metadata?.avatar_url as string | undefined) ?? "";
  const savedAiProvider = (user?.user_metadata?.ai_provider as string | undefined) ?? "";
  const savedAiKey = (user?.user_metadata?.ai_api_key as string | undefined) ?? "";

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black dark:text-white mb-1">설정</h1>
        <p className="text-gray-400 text-sm">계정 정보와 보안을 관리하세요.</p>
      </div>

      <SettingsForm
        email={email}
        fullName={fullName}
        avatarUrl={avatarUrl}
        savedAiProvider={savedAiProvider}
        savedAiKey={savedAiKey}
      />
    </div>
  );
}
