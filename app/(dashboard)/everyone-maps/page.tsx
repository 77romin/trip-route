import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import EveryoneMapsClient from "./EveryoneMapsClient";
import type { PublicTrip } from "@/app/best-maps/page";

export const metadata: Metadata = {
  title: "모두의 지도 — TripRoute",
};

export default async function EveryoneMapsPage() {
  const supabase = await createClient();

  const [tripsResult, authResult] = await Promise.all([
    supabase
      .from("trips")
      .select(
        "id, title, description, region, copy_count, like_count, start_date, end_date, user_id, profiles(full_name, avatar_url), places(lat, lng, day, order)"
      )
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.auth.getUser(),
  ]);

  const trips = (tripsResult.data ?? []) as PublicTrip[];
  const user = authResult.data.user;

  let likedTripIds: string[] = [];
  if (user) {
    const { data: likes } = await supabase
      .from("trip_likes")
      .select("trip_id")
      .eq("user_id", user.id);
    likedTripIds = likes?.map((l) => l.trip_id as string) ?? [];
  }

  return (
    <EveryoneMapsClient
      trips={trips}
      likedTripIds={likedTripIds}
      isLoggedIn={!!user}
    />
  );
}
