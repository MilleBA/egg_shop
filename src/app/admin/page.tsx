import { createClient } from "@/lib/supabase/server";
import type { Availability, Reservation } from "@/lib/types";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: availability } = await supabase
    .from("availability")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle<Availability>();

  const { data: reservations } = await supabase
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Reservation[]>();

  return (
    <AdminDashboard
      availability={availability ?? null}
      reservations={reservations ?? []}
    />
  );
}
