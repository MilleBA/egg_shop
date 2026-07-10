export type ReservationType = "fixed" | "free" | "single";

export type Listing = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  reservation_type: ReservationType;
  quantity_options: number[];
  available_count: number;
  price: number | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Reservation = {
  id: string;
  listing_id: string | null;
  name: string;
  phone: string;
  quantity: number;
  note: string | null;
  created_at: string;
};

export const RESERVATION_TYPE_LABELS: Record<ReservationType, string> = {
  fixed: "Faste valg (f.eks. 6/12/24)",
  free: "Fritt antall",
  single: "Én enhet per reservasjon",
};
