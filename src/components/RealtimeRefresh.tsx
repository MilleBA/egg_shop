"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Abonnerer på endringer i en tabell via Supabase Realtime, og henter
// serverdataene på nytt (router.refresh) når noe endres – slik at åpne
// sider viser fersk beholdning i sanntid.
export default function RealtimeRefresh({
  table = "listings",
  filter,
}: {
  table?: string;
  filter?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-${table}-${filter ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, ...(filter ? { filter } : {}) },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, table, filter]);

  return null;
}
