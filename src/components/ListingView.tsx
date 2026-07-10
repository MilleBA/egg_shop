import Link from "next/link";
import type { Listing } from "@/lib/types";
import ProductImage from "@/components/ProductImage";
import StatusPill from "@/components/StatusPill";
import Divider from "@/components/Divider";
import ReservationForm from "@/components/ReservationForm";

// Felles visning for både hero (1 annonse) og detalje (fra kort).
export default function ListingView({
  listing,
  variant,
}: {
  listing: Listing;
  variant: "hero" | "detail";
}) {
  const isHero = variant === "hero";

  return (
    <div className="animate-scrin px-6 pb-10 pt-6">
      {isHero ? (
        <p className="mb-1 text-center font-body text-[14px] italic text-muted">
          — til salgs nå —
        </p>
      ) : (
        <Link
          href="/"
          className="mb-[18px] inline-block rounded-md border-[1.5px] border-red bg-card px-4 py-2 font-sans text-[13px] font-semibold text-red transition hover:bg-red hover:text-card"
        >
          ← Butikk
        </Link>
      )}

      {isHero && <Divider className="mb-5 mt-2" />}

      <ProductImage
        src={listing.image_url}
        alt={listing.title}
        heightClass={isHero ? "h-[300px]" : "h-[250px]"}
        priority
      />

      {isHero ? (
        <>
          <h1 className="mt-6 text-center font-display text-[32px] leading-[1.08] text-ink">
            {listing.title}
          </h1>
          <div className="mb-3 mt-2 flex items-center justify-center gap-2.5">
            {listing.category && (
              <span className="font-body text-[14px] italic text-unit">
                {listing.category}
              </span>
            )}
            <StatusPill count={listing.available_count} size="lg" />
          </div>
          {listing.description && (
            <p className="mx-2 mb-6 whitespace-pre-line text-center font-body text-[15px] leading-[1.6] text-body">
              {listing.description}
            </p>
          )}
        </>
      ) : (
        <>
          <h1 className="mt-6 font-display text-[28px] leading-[1.08] text-ink">
            {listing.title}
          </h1>
          <div className="mb-3.5 mt-1 flex items-center gap-2.5">
            {listing.category && (
              <span className="font-body text-[14px] italic text-unit">
                {listing.category}
              </span>
            )}
            <StatusPill count={listing.available_count} size="lg" />
          </div>
          {listing.description && (
            <p className="mb-5 whitespace-pre-line font-body text-[15px] leading-[1.6] text-body">
              {listing.description}
            </p>
          )}
        </>
      )}

      <ReservationForm
        listingId={listing.id}
        title={listing.title}
        reservationType={listing.reservation_type}
        quantityOptions={listing.quantity_options}
        availableCount={listing.available_count}
        price={listing.price}
      />
    </div>
  );
}
