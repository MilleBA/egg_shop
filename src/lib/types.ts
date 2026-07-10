export type Availability = {
  id: string;
  available_count: number;
  image_url: string | null;
  note: string | null;
  updated_at: string;
};

export type Reservation = {
  id: string;
  name: string;
  phone: string;
  quantity: number;
  note: string | null;
  created_at: string;
};

// Tillatte antall egg per reservasjon
export const QUANTITIES = [6, 12, 24] as const;
export type Quantity = (typeof QUANTITIES)[number];
