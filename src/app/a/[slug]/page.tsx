import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/types";
import ReservationForm from "@/components/ReservationForm";
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

  const soldOut = listing.available_count <= 0;

  return (
    <main className="min-h-screen w-full">
      <RealtimeRefresh table="listings" filter={`id=eq.${listing.id}`} />
      <div className="mx-auto max-w-2xl px-6 pt-8">
        <Link
          href="/"
          className="text-sm font-medium text-stone-500 hover:text-stone-800"
        >
          ← Tilbake
        </Link>
      </div>

      {/* Kort */}
      <section className="mx-auto max-w-2xl px-6 pt-6">
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          {listing.image_url && (
            <div className="relative aspect-[16/10] w-full bg-stone-100">
              <Image
                src={listing.image_url}
                alt={listing.title}
                fill
                sizes="(max-width: 672px) 100vw, 672px"
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-stone-800">
              {listing.title}
            </h1>

            {listing.description && (
              <p className="mt-3 whitespace-pre-line text-stone-600">
                {listing.description}
              </p>
            )}

            <div className="mt-5">
              {soldOut ? (
                <p className="inline-block rounded-full bg-stone-800 px-4 py-1.5 text-sm font-semibold text-white">
                  Utsolgt 😴
                </p>
              ) : (
                <p className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-800">
                  {listing.available_count} tilgjengelig
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Reservasjon */}
      <section className="mx-auto max-w-2xl px-6 py-8">
        {soldOut ? (
          <p className="rounded-3xl border border-dashed border-stone-200 p-8 text-center text-stone-400">
            Alt er reservert for nå. Kom gjerne tilbake senere!
          </p>
        ) : (
          <ReservationForm
            listingId={listing.id}
            reservationType={listing.reservation_type}
            quantityOptions={listing.quantity_options}
            availableCount={listing.available_count}
          />
        )}
      </section>
    </main>
  );
}
