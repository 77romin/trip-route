"use server";

import { createClient } from "@/lib/supabase/server";

export type AiProvider = "claude" | "gemini" | "chatgpt";

interface AiPlace {
  day: number;
  order: number;
  name: string;
  address: string;
  category: string;
  duration_minutes: number;
  notes: string;
}

async function callAI(provider: AiProvider, apiKey: string, prompt: string): Promise<string> {
  if (provider === "claude") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message ?? "Claude API 오류");
    return data.content[0].text;
  }

  if (provider === "gemini") {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 4096 },
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message ?? "Gemini API 오류");
    return data.candidates[0].content.parts[0].text;
  }

  if (provider === "chatgpt") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4096,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message ?? "ChatGPT API 오류");
    return data.choices[0].message.content;
  }

  throw new Error("지원하지 않는 AI입니다.");
}

async function geocodePlace(name: string, address: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;
  const query = address ? `${name}, ${address}` : name;
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&language=ko&key=${apiKey}`
  );
  const data = await res.json();
  if (data.status === "OK" && data.results[0]) {
    const loc = data.results[0].geometry.location;
    return { lat: loc.lat, lng: loc.lng };
  }
  return null;
}

export async function generateTripWithAI(input: {
  title: string;
  description: string;
  region: string;
  start_date: string;
  end_date: string;
  provider: AiProvider;
  apiKey: string;
  saveKey: boolean;
}): Promise<{ tripId?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const start = new Date(input.start_date);
  const end = new Date(input.end_date);
  const dayCount = Math.max(
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    1
  );
  const nights = dayCount - 1;
  const defaultTitle = `${input.region} ${nights > 0 ? `${nights}박 ${dayCount}일` : "당일치기"}`;

  const prompt = `당신은 전문 여행 플래너입니다. 아래 정보를 바탕으로 ${dayCount}일 여행 일정을 JSON으로 생성하세요.

여행 정보:
- 제목: ${input.title || defaultTitle}
- 설명/요청: ${input.description || "자유 여행"}
- 지역: ${input.region}
- 기간: ${input.start_date} ~ ${input.end_date} (${dayCount}일)

반드시 아래 JSON 형식만 응답하세요 (다른 텍스트 없이):
\`\`\`json
{
  "places": [
    {
      "day": 1,
      "order": 1,
      "name": "장소명",
      "address": "도시, 국가 포함 정확한 주소",
      "category": "attraction",
      "duration_minutes": 90,
      "notes": "추천 이유 또는 팁"
    }
  ]
}
\`\`\`

규칙:
- category는 반드시 attraction, restaurant, cafe, hotel, transport, shopping, other 중 하나
- 하루 4~5곳 (식당/카페 각 날 1~2개 포함)
- 동선이 효율적이도록 지리적 순서로 배치
- notes는 한국어로 유용한 팁 1~2문장
- address는 Google Maps 검색 가능한 형태로 정확하게`;

  let rawText: string;
  try {
    rawText = await callAI(input.provider, input.apiKey, prompt);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "AI 호출 실패" };
  }

  // JSON 추출
  const jsonMatch =
    rawText.match(/```json\s*([\s\S]*?)\s*```/) ??
    rawText.match(/```\s*([\s\S]*?)\s*```/) ??
    rawText.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) return { error: "AI 응답을 파싱할 수 없어요. 다시 시도해주세요." };

  let parsed: { places: AiPlace[] };
  try {
    parsed = JSON.parse(jsonMatch[1]);
  } catch {
    return { error: "AI 응답 형식이 올바르지 않아요." };
  }
  if (!parsed.places?.length) return { error: "생성된 장소가 없어요." };

  // 여행 생성
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      title: input.title || defaultTitle,
      description: input.description || null,
      start_date: input.start_date || null,
      end_date: input.end_date || null,
      region: input.region || null,
    })
    .select("id")
    .single();

  if (tripError || !trip) return { error: "여행 생성에 실패했어요." };

  // 장소 지오코딩 + 삽입
  const geocoded = await Promise.all(
    parsed.places.map(async (p) => {
      const coords = await geocodePlace(p.name, p.address);
      return coords ? { ...p, ...coords } : null;
    })
  );

  const validPlaces = geocoded
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .map((p) => ({
      trip_id: trip.id,
      name: p.name,
      address: p.address,
      lat: p.lat,
      lng: p.lng,
      day: p.day,
      order: p.order,
      category: p.category,
      duration_minutes: p.duration_minutes,
      notes: p.notes,
    }));

  if (validPlaces.length > 0) {
    await supabase.from("places").insert(validPlaces);
  }

  // API 키 저장 선택 시
  if (input.saveKey) {
    await supabase.auth.updateUser({
      data: { ai_provider: input.provider, ai_api_key: input.apiKey },
    });
  }

  return { tripId: trip.id };
}
