import { createClient } from "@/lib/supabase/server";
import type { Listing, Reservation } from "@/lib/types";
import AdminHome from "./AdminHome";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<Listing[]>();

  const { data: reservations } = await supabase
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Reservation[]>();

  return (
    <AdminHome
      listings={listings ?? []}
      reservations={reservations ?? []}
    />
  );
}
