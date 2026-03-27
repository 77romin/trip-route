"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PlaceCategory } from "@/types";

interface AddPlaceInput {
  name: string;
  address: string;
  lat: number;
  lng: number;
  google_place_id?: string;
  category?: PlaceCategory;
  notes?: string;
  duration_minutes?: number;
  day: number;
  order: number;
}

export async function addPlace(tripId: string, data: AddPlaceInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("places").insert({
    trip_id: tripId,
    ...data,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/trips/${tripId}`);
}

export async function removePlace(placeId: string, tripId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("places").delete().eq("id", placeId);
  if (error) throw new Error(error.message);
  revalidatePath(`/trips/${tripId}`);
}

export async function reorderPlaces(
  updates: { id: string; order: number }[],
  tripId: string
) {
  const supabase = await createClient();
  await Promise.all(
    updates.map(({ id, order }) =>
      supabase.from("places").update({ order }).eq("id", id)
    )
  );
  revalidatePath(`/trips/${tripId}`);
}

export async function updatePlace(
  placeId: string,
  tripId: string,
  data: { notes?: string; duration_minutes?: number | null; category?: PlaceCategory }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("places")
    .update(data)
    .eq("id", placeId);
  if (error) throw new Error(error.message);
  revalidatePath(`/trips/${tripId}`);
}

export async function toggleTripPublic(tripId: string, isPublic: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");
  const { error } = await supabase
    .from("trips")
    .update({ is_public: isPublic })
    .eq("id", tripId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath(`/trips/${tripId}`);
}
