import { createBrowserClient } from "@supabase/ssr";

// Klient for bruk i nettleseren ("use client"-komponenter).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
