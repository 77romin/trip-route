import { createClient } from "@/lib/supabase/server";
import { PlusCircle, MapPin, Calendar, LogIn } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "내 여행 — TripRoute",
};

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

function buildStaticMapUrl(places: { lat: number; lng: number }[]): string | null {
  if (!places.length || !API_KEY) return null;

  const sorted = places.slice(0, 20);
  const markerParams = sorted
    .map((p) => `markers=size:small%7Ccolor:0x000000%7C${p.lat},${p.lng}`)
    .join("&");
  const pathCoords = sorted.map((p) => `${p.lat},${p.lng}`).join("|");
  const pathParam =
    sorted.length > 1
      ? `&path=color:0x000000ff%7Cweight:3%7C${encodeURIComponent(pathCoords)}`
      : "";

  return `https://maps.googleapis.com/maps/api/staticmap?size=400x200&scale=2&maptype=roadmap&${markerParams}${pathParam}&key=${API_KEY}`;
}

export default async function TripsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tripsRaw } = await supabase
    .from("trips")
    .select("*, places(lat, lng, day, order)")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  const trips = tripsRaw ?? [];

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">내 여행</h1>
          <p className="text-gray-400 text-sm">
            {trips.length}개의 여행 계획
          </p>
        </div>
        <Link
          href="/trips/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-sm font-medium transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          새 여행 만들기
        </Link>
      </div>

      {/* 여행 목록 */}
      {trips.length === 0 ? (
        <EmptyState isGuest={!user} />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {trips.map((trip) => {
            const places = ((trip.places ?? []) as { lat: number; lng: number; day: number; order: number }[])
              .sort((a, b) => a.day - b.day || a.order - b.order);
            const mapUrl = buildStaticMapUrl(places);
            return (
              <TripCard key={trip.id as string} trip={trip} mapUrl={mapUrl} />
            );
          })}
        </div>
      )}
    </div>
  );
}

function TripCard({
  trip,
  mapUrl,
}: {
  trip: Record<string, unknown>;
  mapUrl: string | null;
}) {
  const title = trip.title as string;
  const description = trip.description as string | undefined;
  const startDate = trip.start_date as string | undefined;
  const endDate = trip.end_date as string | undefined;
  const id = trip.id as string;

  return (
    <Link href={`/trips/${id}`}>
      <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md hover:shadow-black/5 cursor-pointer group transition-all">
        {/* 커버 이미지 */}
        <div className="w-full h-32 rounded-xl bg-gray-100 border border-gray-100 mb-5 overflow-hidden flex items-center justify-center">
          {mapUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mapUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <MapPin className="w-8 h-8 text-gray-300" />
          )}
        </div>

        <h3 className="text-black font-semibold text-base mb-1.5 group-hover:text-gray-700 transition-colors">
          {title}
        </h3>

        {description && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {(startDate || endDate) && (
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {startDate ?? "??"} ~ {endDate ?? "??"}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

function EmptyState({ isGuest }: { isGuest: boolean }) {
  if (isGuest) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-100 flex items-center justify-center mb-5">
          <MapPin className="w-7 h-7 text-gray-300" />
        </div>
        <h3 className="text-black font-semibold text-lg mb-2">
          로그인하면 여행을 저장할 수 있어요
        </h3>
        <p className="text-gray-400 text-sm mb-8 max-w-xs">
          지금은 체험 중이에요. 로그인하면 여행을 저장하고 언제든 다시 볼 수 있어요.
        </p>
        <div className="flex gap-3">
          <Link
            href="/trips/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-black text-sm font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            여행 만들어보기
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-sm font-medium transition-colors"
          >
            <LogIn className="w-4 h-4" />
            로그인
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-100 flex items-center justify-center mb-5">
        <MapPin className="w-7 h-7 text-gray-300" />
      </div>
      <h3 className="text-black font-semibold text-lg mb-2">
        아직 여행이 없어요
      </h3>
      <p className="text-gray-400 text-sm mb-8 max-w-xs">
        첫 번째 여행을 만들고 스마트한 동선 계획을 시작해보세요.
      </p>
      <Link
        href="/trips/new"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-sm font-medium transition-colors"
      >
        <PlusCircle className="w-4 h-4" />
        첫 여행 만들기
      </Link>
    </div>
  );
}
