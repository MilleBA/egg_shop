import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/types";
import ListingEditor from "./ListingEditor";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // "ny" = opprett ny annonse
  if (id === "ny") {
    return <ListingEditor listing={null} />;
  }

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle<Listing>();

  if (!listing) {
    notFound();
  }

  return <ListingEditor listing={listing} />;
}
