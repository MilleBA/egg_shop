"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slug";
import {
  RESERVATION_TYPE_LABELS,
  type Listing,
  type ReservationType,
} from "@/lib/types";
import QrCode from "@/components/QrCode";

export default function ListingEditor({ listing }: { listing: Listing | null }) {
  const router = useRouter();
  const supabase = createClient();
  const isNew = listing === null;

  const [title, setTitle] = useState(listing?.title ?? "");
  const [slug, setSlug] = useState(listing?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(!isNew);
  const [description, setDescription] = useState(listing?.description ?? "");
  const [category, setCategory] = useState(listing?.category ?? "");
  const [reservationType, setReservationType] = useState<ReservationType>(
    listing?.reservation_type ?? "fixed"
  );
  const [optionsText, setOptionsText] = useState(
    (listing?.quantity_options ?? [6, 12, 24]).join(", ")
  );
  const [availableCount, setAvailableCount] = useState<number>(
    listing?.available_count ?? 0
  );
  const [priceText, setPriceText] = useState(
    listing?.price != null ? String(listing.price) : ""
  );
  const [isPublished, setIsPublished] = useState(listing?.is_published ?? true);
  const [sortOrder, setSortOrder] = useState<number>(listing?.sort_order ?? 0);
  const [imageUrl, setImageUrl] = useState<string | null>(
    listing?.image_url ?? null
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("listing-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (error) {
      setUploading(false);
      setMessage("Klarte ikke å laste opp bildet.");
      return;
    }

    const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
    setMessage("Bilde lastet opp – husk å lagre.");
  }

  function parseOptions(): number[] {
    return optionsText
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n) && n > 0);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const finalSlug = (slug || slugify(title)).trim();
    if (!title.trim() || !finalSlug) {
      setMessage("Tittel er påkrevd.");
      return;
    }

    const quantityOptions =
      reservationType === "fixed" ? parseOptions() : [];
    if (reservationType === "fixed" && quantityOptions.length === 0) {
      setMessage("Skriv minst ett antall-valg, f.eks. «6, 12, 24».");
      return;
    }

    const price = priceText.trim() === "" ? null : Number(priceText);
    if (price != null && !Number.isFinite(price)) {
      setMessage("Pris må være et tall (eller stå tom).");
      return;
    }

    setSaving(true);

    const payload = {
      slug: finalSlug,
      title: title.trim(),
      description: description.trim() || null,
      category: category.trim() || null,
      reservation_type: reservationType,
      quantity_options: reservationType === "fixed" ? quantityOptions : [],
      available_count: Math.max(0, Math.floor(availableCount)),
      price,
      is_published: isPublished,
      sort_order: Math.floor(sortOrder),
      image_url: imageUrl,
      updated_at: new Date().toISOString(),
    };

    const { error } = isNew
      ? await supabase.from("listings").insert(payload)
      : await supabase.from("listings").update(payload).eq("id", listing.id);

    setSaving(false);

    if (error) {
      if (error.code === "23505") {
        setMessage("Denne URL-en (slug) er allerede i bruk. Velg en annen.");
      } else {
        setMessage("Klarte ikke å lagre. Prøv igjen.");
      }
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/admin"
        className="text-sm font-medium text-stone-500 hover:text-stone-800"
      >
        ← Tilbake til admin
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-stone-800">
        {isNew ? "Ny annonse" : "Rediger annonse"}
      </h1>

      <form
        onSubmit={handleSave}
        className="mt-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
      >
        {/* Tittel */}
        <label htmlFor="title" className="text-sm font-medium text-stone-700">
          Tittel
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          placeholder="F.eks. «Kaninunger til salgs»"
        />

        {/* Slug */}
        <label
          htmlFor="slug"
          className="mt-4 block text-sm font-medium text-stone-700"
        >
          URL (slug)
        </label>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm text-stone-400">/a/</span>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugEdited(true);
            }}
            className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            placeholder="kaninunger"
          />
        </div>

        {/* Beskrivelse */}
        <label
          htmlFor="description"
          className="mt-4 block text-sm font-medium text-stone-700"
        >
          Kort tekst
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full resize-none rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          placeholder="Beskriv varen kort …"
        />

        {/* Kategori */}
        <label
          htmlFor="category"
          className="mt-4 block text-sm font-medium text-stone-700"
        >
          Kategori <span className="text-stone-400">(valgfritt)</span>
        </label>
        <input
          id="category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          placeholder="egg, kanin …"
        />

        {/* Reservasjonstype */}
        <label
          htmlFor="rtype"
          className="mt-4 block text-sm font-medium text-stone-700"
        >
          Reservasjonstype
        </label>
        <select
          id="rtype"
          value={reservationType}
          onChange={(e) =>
            setReservationType(e.target.value as ReservationType)
          }
          className="mt-1 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        >
          {(Object.keys(RESERVATION_TYPE_LABELS) as ReservationType[]).map(
            (t) => (
              <option key={t} value={t}>
                {RESERVATION_TYPE_LABELS[t]}
              </option>
            )
          )}
        </select>

        {reservationType === "fixed" && (
          <>
            <label
              htmlFor="options"
              className="mt-4 block text-sm font-medium text-stone-700"
            >
              Antall-valg (kommaseparert)
            </label>
            <input
              id="options"
              type="text"
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
              placeholder="6, 12, 24"
            />
          </>
        )}

        {/* Lager */}
        <label
          htmlFor="count"
          className="mt-4 block text-sm font-medium text-stone-700"
        >
          Antall tilgjengelig (lager)
        </label>
        <input
          id="count"
          type="number"
          min={0}
          value={availableCount}
          onChange={(e) => setAvailableCount(Number(e.target.value))}
          className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 text-lg outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        />

        {/* Pris (forberedt for betaling) */}
        <label
          htmlFor="price"
          className="mt-4 block text-sm font-medium text-stone-700"
        >
          Pris i kr{" "}
          <span className="text-stone-400">(valgfritt – for senere)</span>
        </label>
        <input
          id="price"
          type="number"
          min={0}
          step="0.01"
          value={priceText}
          onChange={(e) => setPriceText(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          placeholder="F.eks. 50"
        />

        {/* Rekkefølge + publisert */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="sort"
              className="block text-sm font-medium text-stone-700"
            >
              Rekkefølge
            </label>
            <input
              id="sort"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            />
          </div>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 py-3">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-5 w-5 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
              />
              <span className="text-sm font-medium text-stone-700">
                Publisert (synlig på forsiden)
              </span>
            </label>
          </div>
        </div>

        {/* Bilde */}
        <div className="mt-4">
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
          {saving ? "Lagrer …" : isNew ? "Opprett annonse" : "Lagre endringer"}
        </button>
      </form>

      {/* QR per annonse (kun når annonsen finnes) */}
      {!isNew && (
        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-stone-800">
            QR-kode til denne annonsen
          </h2>
          <p className="mt-1 mb-6 text-sm text-stone-500">
            Peker rett til «{listing.title}».
          </p>
          <QrCode
            path={`/a/${listing.slug}`}
            filename={`${listing.slug}-qr.png`}
            caption="Skriv ut og heng opp der du selger denne varen."
          />
        </section>
      )}
    </main>
  );
}
