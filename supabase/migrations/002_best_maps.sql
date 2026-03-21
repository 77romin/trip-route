-- ============================================================
-- 최고의 지도 기능: 복사 횟수 · 좋아요 · 지역 추가
-- ============================================================

-- trips 에 신규 컬럼 추가
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS copy_count integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS like_count  integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS region      text;

-- 공개 여행의 장소를 모두 조회할 수 있는 정책 추가
CREATE POLICY "places: 공개 여행 조회" ON public.places
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = places.trip_id
        AND trips.is_public = true
    )
  );

-- ============================================================
-- 좋아요 테이블
-- ============================================================

CREATE TABLE IF NOT EXISTS public.trip_likes (
  id         uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id    uuid         REFERENCES public.trips(id)    ON DELETE CASCADE NOT NULL,
  user_id    uuid         REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz  DEFAULT now() NOT NULL,
  UNIQUE (trip_id, user_id)
);

ALTER TABLE public.trip_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trip_likes: 모두 조회"  ON public.trip_likes
  FOR SELECT USING (true);

CREATE POLICY "trip_likes: 본인 추가"  ON public.trip_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trip_likes: 본인 삭제"  ON public.trip_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 좋아요 수 자동 갱신 트리거
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_trip_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.trips SET like_count = like_count + 1 WHERE id = NEW.trip_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.trips SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.trip_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trip_likes_count_trigger
  AFTER INSERT OR DELETE ON public.trip_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_trip_like_count();

-- ============================================================
-- copy_count 증가용 RPC (다른 사용자의 공개 여행에도 적용)
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_trip_copy_count(trip_id uuid)
RETURNS void AS $$
  UPDATE public.trips SET copy_count = copy_count + 1 WHERE id = trip_id;
$$ LANGUAGE sql SECURITY DEFINER;
