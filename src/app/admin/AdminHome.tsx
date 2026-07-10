"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Listing, Reservation } from "@/lib/types";
import ProductImage from "@/components/ProductImage";
import StatusPill from "@/components/StatusPill";
import QrCode from "@/components/QrCode";

const outlineBtn =
  "rounded-md border-[1.5px] border-red bg-card px-3 py-1.5 font-sans text-[12px] font-semibold text-red transition hover:bg-red hover:text-card disabled:opacity-50";

export default function AdminHome({
  listings,
  reservations,
}: {
  listings: Listing[];
  reservations: Reservation[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function togglePublish(listing: Listing) {
    setBusyId(listing.id);
    await supabase
      .from("listings")
      .update({
        is_published: !listing.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", listing.id);
    setBusyId(null);
    router.refresh();
  }

  async function deleteListing(listing: Listing) {
    if (
      !confirm(
        `Slette annonsen «${listing.title}»? Reservasjoner beholdes, men mister koblingen til annonsen.`
      )
    ) {
      return;
    }
    setBusyId(listing.id);
    await supabase.from("listings").delete().eq("id", listing.id);
    setBusyId(null);
    router.refresh();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const titleById = new Map(listings.map((l) => [l.id, l.title]));

  return (
    <main className="animate-scrin mx-auto max-w-3xl px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[28px] text-ink">Admin</h1>
          <p className="font-body text-[14px] italic text-muted">
            Styr gårdsbutikken din.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-md border-[1.5px] border-red bg-card px-4 py-2 font-sans text-[13px] font-semibold text-red transition hover:bg-red hover:text-card"
        >
          Logg ut
        </button>
      </div>

      {/* Annonser */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[22px] text-ink">Annonser</h2>
          <Link
            href="/admin/annonser/ny"
            className="rounded-[7px] bg-barn px-4 py-2 font-display text-[14px] text-card shadow-[inset_0_1px_0_rgba(255,255,255,.18)] transition hover:bg-barn-hover active:scale-[.98]"
          >
            + Ny annonse
          </Link>
        </div>

        {listings.length === 0 ? (
          <p className="folk-card mt-4 p-6 text-center font-body italic text-muted">
            Ingen annonser ennå. Lag din første!
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {listings.map((l) => (
              <li key={l.id} className="folk-card flex items-center gap-3.5 p-3">
                <div className="w-16 shrink-0">
                  <ProductImage
                    src={l.image_url}
                    alt={l.title}
                    heightClass="h-16"
                    radiusClass="rounded-[4px]"
                    frame="inset 0 0 0 2px #8e2323"
                    sizes="64px"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-display text-[18px] text-ink">
                      {l.title}
                    </p>
                    {!l.is_published && (
                      <span className="rounded border border-red bg-[#edd8cc] px-2 py-0.5 font-sans text-[11px] font-semibold text-[#8f4032]">
                        Skjult
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    <StatusPill count={l.available_count} />
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => togglePublish(l)}
                      disabled={busyId === l.id}
                      className={outlineBtn}
                    >
                      {l.is_published ? "Skjul" : "Publiser"}
                    </button>
                    <Link
                      href={`/admin/annonser/${l.id}`}
                      className="rounded-md bg-red px-3 py-1.5 font-sans text-[12px] font-semibold text-card transition hover:bg-barn"
                    >
                      Rediger
                    </Link>
                  </div>
                  <button
                    onClick={() => deleteListing(l)}
                    disabled={busyId === l.id}
                    className="font-sans text-[12px] font-semibold text-barn hover:underline disabled:opacity-50"
                  >
                    Slett
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* QR til forsiden */}
      <section className="folk-card mt-10 p-6">
        <h2 className="font-display text-[22px] text-ink">
          QR-kode til forsiden
        </h2>
        <p className="mb-6 mt-1 font-body text-[14px] italic text-muted">
          Peker til oversikten over alle annonser. Egen QR per annonse finner du
          inne på hver annonse.
        </p>
        <QrCode
          filename="amundsen-qr.png"
          caption="Heng på postkassen for å vise alt du selger."
        />
      </section>

      {/* Reservasjoner */}
      <section className="mt-10">
        <h2 className="font-display text-[22px] text-ink">
          Reservasjoner{" "}
          <span className="text-muted">({reservations.length})</span>
        </h2>

        {reservations.length === 0 ? (
          <p className="folk-card mt-3 p-6 text-center font-body italic text-muted">
            Ingen reservasjoner ennå.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {reservations.map((r) => (
              <li key={r.id} className="folk-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-[18px] text-ink">
                      {r.name}
                    </p>
                    <a
                      href={`tel:${r.phone}`}
                      className="font-sans text-[14px] font-semibold text-barn hover:underline"
                    >
                      {r.phone}
                    </a>
                    <p className="mt-0.5 font-body text-[13px] italic text-unit">
                      {r.listing_id
                        ? (titleById.get(r.listing_id) ?? "Ukjent annonse")
                        : "Slettet annonse"}
                    </p>
                    {r.note && (
                      <p className="mt-1 font-body text-[14px] italic text-body">
                        “{r.note}”
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded border border-red bg-[#f2e3b6] px-3 py-1 font-sans text-[13px] font-semibold text-[#8a6212]">
                      {r.quantity} stk
                    </span>
                    <p className="mt-1 font-body text-[12px] text-unit">
                      {new Date(r.created_at).toLocaleString("no-NO", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
