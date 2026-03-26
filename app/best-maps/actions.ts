"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function copyTrip(
  tripId: string
): Promise<{ newTripId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요한 기능입니다." };

  // 원본 공개 여행 조회
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .eq("is_public", true)
    .single();

  if (tripError || !trip) return { error: "여행을 찾을 수 없어요." };

  // 새 여행 생성
  const { data: newTrip, error: insertError } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      title: `${trip.title} (복사본)`,
      description: trip.description ?? null,
      start_date: trip.start_date ?? null,
      end_date: trip.end_date ?? null,
      region: trip.region ?? null,
      is_public: false,
    })
    .select("id")
    .single();

  if (insertError || !newTrip) return { error: "복사에 실패했어요." };

  // 장소 복사 (places: 공개 여행 조회 정책 필요)
  const { data: places } = await supabase
    .from("places")
    .select("*")
    .eq("trip_id", tripId);

  if (places && places.length > 0) {
    await supabase.from("places").insert(
      places.map(({ id: _id, trip_id: _tid, created_at: _cat, ...rest }) => ({
        ...rest,
        trip_id: newTrip.id,
      }))
    );
  }

  // 복사 횟수 증가 (직접 업데이트)
  await supabase
    .from("trips")
    .update({ copy_count: (trip.copy_count ?? 0) + 1 })
    .eq("id", tripId);

  revalidatePath("/best-maps");
  return { newTripId: newTrip.id as string };
}

export async function toggleLike(
  tripId: string
): Promise<{ liked: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { liked: false, error: "로그인이 필요한 기능입니다." };

  const { data: existing } = await supabase
    .from("trip_likes")
    .select("id")
    .eq("trip_id", tripId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("trip_likes")
      .delete()
      .eq("trip_id", tripId)
      .eq("user_id", user.id);
    if (error) return { liked: true, error: "좋아요 취소에 실패했어요." };

    // like_count 감소
    const { data: trip } = await supabase
      .from("trips")
      .select("like_count")
      .eq("id", tripId)
      .single();
    if (trip) {
      await supabase
        .from("trips")
        .update({ like_count: Math.max((trip.like_count ?? 1) - 1, 0) })
        .eq("id", tripId);
    }

    revalidatePath("/best-maps");
    return { liked: false };
  } else {
    const { error } = await supabase
      .from("trip_likes")
      .insert({ trip_id: tripId, user_id: user.id });
    if (error) return { liked: false, error: "좋아요에 실패했어요." };

    // like_count 증가
    const { data: trip } = await supabase
      .from("trips")
      .select("like_count")
      .eq("id", tripId)
      .single();
    if (trip) {
      await supabase
        .from("trips")
        .update({ like_count: (trip.like_count ?? 0) + 1 })
        .eq("id", tripId);
    }

    revalidatePath("/best-maps");
    return { liked: true };
  }
}
