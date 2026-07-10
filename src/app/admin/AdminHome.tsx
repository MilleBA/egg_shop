"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Listing, Reservation } from "@/lib/types";
import QrCode from "@/components/QrCode";

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
      .update({ is_published: !listing.is_published, updated_at: new Date().toISOString() })
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
    <main className="mx-auto max-w-3xl px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">🌾 Admin</h1>
          <p className="text-sm text-stone-500">Styr annonsene dine.</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
        >
          Logg ut
        </button>
      </div>

      {/* Annonser */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-800">Annonser</h2>
          <Link
            href="/admin/annonser/ny"
            className="rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            + Ny annonse
          </Link>
        </div>

        {listings.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-stone-200 p-6 text-center text-stone-400">
            Ingen annonser ennå. Lag din første!
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {listings.map((l) => (
              <li
                key={l.id}
                className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                  {l.image_url ? (
                    <Image
                      src={l.image_url}
                      alt={l.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                      🧺
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-stone-800">
                      {l.title}
                    </p>
                    {!l.is_published && (
                      <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-600">
                        Skjult
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-stone-400">
                    {l.available_count} tilgjengelig
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => togglePublish(l)}
                    disabled={busyId === l.id}
                    className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-50"
                  >
                    {l.is_published ? "Skjul" : "Publiser"}
                  </button>
                  <Link
                    href={`/admin/annonser/${l.id}`}
                    className="rounded-xl bg-stone-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-700"
                  >
                    Rediger
                  </Link>
                  <button
                    onClick={() => deleteListing(l)}
                    disabled={busyId === l.id}
                    className="rounded-xl px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    aria-label="Slett"
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
      <section className="mt-10 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-stone-800">QR-kode til forsiden</h2>
        <p className="mt-1 mb-6 text-sm text-stone-500">
          Peker til oversikten over alle annonser. (Egen QR per annonse finner du
          inne på hver annonse.)
        </p>
        <QrCode
          filename="butikk-qr.png"
          caption="Heng på postkassen for å vise alt du selger."
        />
      </section>

      {/* Reservasjoner */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-stone-800">
          Reservasjoner{" "}
          <span className="text-stone-400">({reservations.length})</span>
        </h2>

        {reservations.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-stone-200 p-6 text-center text-stone-400">
            Ingen reservasjoner ennå.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {reservations.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-stone-800">{r.name}</p>
                    <a
                      href={`tel:${r.phone}`}
                      className="text-sm text-amber-600 hover:underline"
                    >
                      {r.phone}
                    </a>
                    <p className="mt-0.5 text-xs text-stone-400">
                      {r.listing_id
                        ? (titleById.get(r.listing_id) ?? "Ukjent annonse")
                        : "Slettet annonse"}
                    </p>
                    {r.note && (
                      <p className="mt-1 text-sm text-stone-500">“{r.note}”</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                      {r.quantity} stk
                    </span>
                    <p className="mt-1 text-xs text-stone-400">
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
