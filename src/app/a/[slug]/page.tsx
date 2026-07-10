import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/types";
import ListingView from "@/components/ListingView";
import RealtimeRefresh from "@/components/RealtimeRefresh";

export const dynamic = "force-dynamic";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle<Listing>();

  if (!listing) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl">
      <RealtimeRefresh table="listings" filter={`id=eq.${listing.id}`} />
      <ListingView listing={listing} variant="detail" />
    </main>
  );
}
