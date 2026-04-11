import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/landing/Navbar";
import BestMapsClient from "./BestMapsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "최고의 지도 — TripRoute",
};

export type ProfileSnippet = {
  full_name: string | null;
  avatar_url: string | null;
};

export type TripPlaceSnippet = {
  lat: number;
  lng: number;
  day: number;
  order: number;
};

export type PublicTrip = {
  id: string;
  title: string;
  description: string | null;
  region: string | null;
  copy_count: number;
  like_count: number;
  start_date: string | null;
  end_date: string | null;
  user_id: string;
  profiles: ProfileSnippet | ProfileSnippet[];
  places?: TripPlaceSnippet[];
};

export default async function BestMapsPage() {
  const supabase = await createClient();

  const [tripsResult, authResult] = await Promise.all([
    supabase
      .from("trips")
      .select(
        "id, title, description, region, copy_count, like_count, start_date, end_date, user_id, profiles(full_name, avatar_url), places(lat, lng, day, order)"
      )
      .eq("is_public", true)
      .order("copy_count", { ascending: false })
      .order("like_count", { ascending: false })
      .limit(100),
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
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <BestMapsClient
        trips={trips}
        likedTripIds={likedTripIds}
        isLoggedIn={!!user}
      />
    </div>
  );
}
