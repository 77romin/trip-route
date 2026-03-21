import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import type { Place, Trip } from "@/types";
import MapOverviewClient from "@/components/map/MapOverviewClient";

export const metadata: Metadata = {
  title: "한눈에 보기 — TripRoute",
};

export default async function MapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: trips } = await supabase
    .from("trips")
    .select("id, title, start_date, end_date, region")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  const tripIds = trips?.map((t) => t.id) ?? [];

  const { data: places } =
    tripIds.length > 0
      ? await supabase
          .from("places")
          .select("*")
          .in("trip_id", tripIds)
          .order("day", { ascending: true })
          .order("order", { ascending: true })
      : { data: [] };

  return (
    <MapOverviewClient
      trips={(trips ?? []) as Pick<Trip, "id" | "title" | "start_date" | "end_date" | "region">[]}
      places={(places ?? []) as Place[]}
    />
  );
}
