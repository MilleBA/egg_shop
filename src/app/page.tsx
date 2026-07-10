import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/types";
import { priceLabel } from "@/lib/stock";
import ProductImage from "@/components/ProductImage";
import StatusPill from "@/components/StatusPill";
import Divider from "@/components/Divider";
import ListingView from "@/components/ListingView";
import RealtimeRefresh from "@/components/RealtimeRefresh";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<Listing[]>();

  const listings = data ?? [];

  return (
    <main className="mx-auto max-w-2xl">
      <RealtimeRefresh table="listings" />

      {listings.length === 0 && (
        <div className="animate-scrin px-6 py-16">
          <p className="folk-card p-10 text-center font-body italic text-muted">
            Ingenting til salgs akkurat nå. Kom tilbake snart! 🐣
          </p>
        </div>
      )}

      {/* 1 annonse -> hero */}
      {listings.length === 1 && (
        <ListingView listing={listings[0]} variant="hero" />
      )}

      {/* 2+ annonser -> kort */}
      {listings.length > 1 && (
        <div className="animate-scrin px-6 pb-10 pt-6">
          <h1 className="text-center font-display text-[30px] leading-[1.12] tracking-[.01em] text-ink">
            Ferske varer fra gården
          </h1>
          <p className="mt-2 text-center font-body text-[15px] italic text-muted">
            Se hva som er til salgs nå, og reserver enkelt.
          </p>

          <Divider className="my-5" />

          <div>
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>

          <p className="mt-5 text-center font-body text-[15px] italic text-muted">
            Takk for at du handler lokalt 💛
          </p>
        </div>
      )}
    </main>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const price = priceLabel(listing.price);

  return (
    <Link
      href={`/a/${listing.slug}`}
      className="folk-card folk-card-link mb-4 flex gap-3.5 p-3"
    >
      <div className="w-[84px] shrink-0">
        <ProductImage
          src={listing.image_url}
          alt={listing.title}
          heightClass="h-[84px]"
          radiusClass="rounded-[4px]"
          frame="inset 0 0 0 2px #8e2323"
          sizes="84px"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="font-display text-[19px] leading-[1.1] text-ink">
          {listing.title}
        </div>
        {listing.category && (
          <div className="mb-2 mt-0.5 font-body text-[13px] italic text-unit">
            {listing.category}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-2">
          {price ? (
            <span className="font-display text-[17px] text-barn">{price}</span>
          ) : (
            <span className="font-sans text-[13px] font-semibold text-red">
              Reserver →
            </span>
          )}
          <StatusPill count={listing.available_count} />
        </div>
      </div>
    </Link>
  );
}
