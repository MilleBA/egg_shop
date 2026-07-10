import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/types";
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
    <main className="min-h-screen w-full">
      <RealtimeRefresh table="listings" />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-50 via-[#fffdf7] to-[#fffdf7]" />
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-16 pb-8 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800">
            🌾 Gårdsbutikk
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-stone-800 sm:text-5xl">
            Ferske varer fra gården
          </h1>
          <p className="mt-3 max-w-md text-stone-500">
            Se hva som er til salgs akkurat nå, og reserver enkelt.
          </p>
        </div>
      </section>

      {/* Annonser */}
      <section className="mx-auto max-w-3xl px-6 pb-16">
        {listings.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-stone-200 p-10 text-center text-stone-400">
            Ingenting til salgs akkurat nå. Kom tilbake snart! 🐣
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      <footer className="mx-auto max-w-3xl px-6 pb-10 text-center text-sm text-stone-400">
        Takk for at du handler lokalt 💛
      </footer>
    </main>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const soldOut = listing.available_count <= 0;

  return (
    <Link
      href={`/a/${listing.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[16/10] w-full bg-stone-100">
        {listing.image_url ? (
          <Image
            src={listing.image_url}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            className="object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">
            🧺
          </div>
        )}
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
            soldOut
              ? "bg-stone-800/80 text-white"
              : "bg-amber-500/90 text-white"
          }`}
        >
          {soldOut ? "Utsolgt" : `${listing.available_count} igjen`}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-bold text-stone-800">{listing.title}</h2>
        {listing.description && (
          <p className="mt-1 line-clamp-2 text-sm text-stone-500">
            {listing.description}
          </p>
        )}
        <span className="mt-4 text-sm font-semibold text-amber-600 group-hover:underline">
          {soldOut ? "Se annonse →" : "Reserver →"}
        </span>
      </div>
    </Link>
  );
}
