"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Availability, Reservation } from "@/lib/types";
import QrCode from "@/components/QrCode";

export default function AdminDashboard({
  availability,
  reservations,
}: {
  availability: Availability | null;
  reservations: Reservation[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [count, setCount] = useState<number>(
    availability?.available_count ?? 0
  );
  const [note, setNote] = useState<string>(availability?.note ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(
    availability?.image_url ?? null
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    // Unikt filnavn (uten Math.random / Date-avhengighet i klient er ok her)
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `egg-${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("egg-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (error) {
      setUploading(false);
      setMessage("Klarte ikke å laste opp bildet.");
      return;
    }

    const { data } = supabase.storage.from("egg-images").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
    setMessage("Bilde lastet opp – husk å lagre.");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      available_count: Math.max(0, Math.floor(count)),
      note: note.trim() || null,
      image_url: imageUrl,
      updated_at: new Date().toISOString(),
    };

    const query = availability?.id
      ? supabase.from("availability").update(payload).eq("id", availability.id)
      : supabase.from("availability").insert(payload);

    const { error } = await query;

    setSaving(false);
    if (error) {
      setMessage("Klarte ikke å lagre. Prøv igjen.");
      return;
    }
    setMessage("Lagret ✔");
    router.refresh();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            🥚 Admin – Eggsalg
          </h1>
          <p className="text-sm text-stone-500">Styr dagens tilbud.</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
        >
          Logg ut
        </button>
      </div>

      {/* Redigering */}
      <form
        onSubmit={handleSave}
        className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <h2 className="text-lg font-bold text-stone-800">Dagens tilbud</h2>

        {/* Antall */}
        <div className="mt-5">
          <label
            htmlFor="count"
            className="text-sm font-medium text-stone-700"
          >
            Antall egg tilgjengelig
          </label>
          <input
            id="count"
            type="number"
            min={0}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 text-lg outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          />
          <p className="mt-1 text-xs text-stone-400">
            Kunder kan velge 6, 12 eller 24 – så lenge det er nok igjen.
          </p>
        </div>

        {/* Melding */}
        <div className="mt-5">
          <label htmlFor="note" className="text-sm font-medium text-stone-700">
            Kort melding <span className="text-stone-400">(valgfritt)</span>
          </label>
          <textarea
            id="note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 w-full resize-none rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            placeholder="F.eks. «Ekstra mange i dag!»"
          />
        </div>

        {/* Bilde */}
        <div className="mt-5">
          <span className="text-sm font-medium text-stone-700">Bilde</span>
          <div className="mt-2 flex items-center gap-4">
            {imageUrl && (
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-stone-200">
                <Image
                  src={imageUrl}
                  alt="Forhåndsvisning"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            )}
            <label className="cursor-pointer rounded-2xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50">
              {uploading
                ? "Laster opp …"
                : imageUrl
                  ? "Bytt bilde"
                  : "Velg bilde"}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="text-sm text-red-600 hover:underline"
              >
                Fjern
              </button>
            )}
          </div>
        </div>

        {message && (
          <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-stone-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || uploading}
          className="mt-6 w-full rounded-2xl bg-amber-500 px-6 py-3 font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
        >
          {saving ? "Lagrer …" : "Lagre"}
        </button>
      </form>

      {/* QR-kode */}
      <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-stone-800">QR-kode til postkassen</h2>
        <p className="mt-1 mb-6 text-sm text-stone-500">
          Kunder skanner denne for å komme rett til salgssiden.
        </p>
        <QrCode />
      </section>

      {/* Reservasjoner */}
      <section className="mt-8">
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
                    {r.note && (
                      <p className="mt-1 text-sm text-stone-500">“{r.note}”</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                      {r.quantity} egg
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
