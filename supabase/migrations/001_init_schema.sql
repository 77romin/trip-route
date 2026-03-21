-- ============================================================
-- TripRoute 초기 스키마
-- ============================================================

-- profiles 테이블 (auth.users 확장)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- trips 테이블
create table if not exists public.trips (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  start_date date,
  end_date date,
  cover_image text,
  is_public boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- places 테이블
create table if not exists public.places (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  name text not null,
  address text,
  lat double precision not null,
  lng double precision not null,
  "order" integer not null default 0,
  day integer not null default 1,
  duration_minutes integer,
  notes text,
  google_place_id text,
  category text check (
    category in ('attraction','restaurant','cafe','hotel','transport','shopping','other')
  ),
  created_at timestamptz default now() not null
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.places enable row level security;

-- profiles: 본인만 읽기/수정
create policy "profiles: 본인 조회" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: 본인 수정" on public.profiles
  for update using (auth.uid() = id);

-- trips: 본인 소유 + 공개 여행은 모두 조회
create policy "trips: 본인 전체 접근" on public.trips
  for all using (auth.uid() = user_id);

create policy "trips: 공개 여행 조회" on public.trips
  for select using (is_public = true);

-- places: 여행 소유자만 접근
create policy "places: 여행 소유자 접근" on public.places
  for all using (
    exists (
      select 1 from public.trips
      where trips.id = places.trip_id
        and trips.user_id = auth.uid()
    )
  );

-- ============================================================
-- 트리거: updated_at 자동 갱신
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trips_updated_at
  before update on public.trips
  for each row execute function public.handle_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 트리거: 신규 회원가입 시 profiles 자동 생성
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
