export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  cover_image?: string;
  region?: string;
  is_public: boolean;
  copy_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface TripLike {
  id: string;
  trip_id: string;
  user_id: string;
  created_at: string;
}

export interface Place {
  id: string;
  trip_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  order: number;
  day: number;
  duration_minutes?: number;
  notes?: string;
  google_place_id?: string;
  category?: PlaceCategory;
  created_at: string;
}

export type PlaceCategory =
  | "attraction"
  | "restaurant"
  | "cafe"
  | "hotel"
  | "transport"
  | "shopping"
  | "other";

export interface Route {
  trip_id: string;
  day: number;
  places: Place[];
  total_distance?: number;
  total_duration?: number;
}
