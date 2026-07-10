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

const inputClass =
  "mt-1 w-full rounded-md border-[1.5px] border-red bg-card px-4 py-3 font-body text-ink outline-none focus:border-barn focus:ring-2 focus:ring-[#c8912e55]";
const labelClass =
  "block font-sans text-[12px] font-semibold uppercase tracking-[.06em] text-muted";

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

    const quantityOptions = reservationType === "fixed" ? parseOptions() : [];
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
    <main className="animate-scrin mx-auto max-w-2xl px-6 py-8">
      <Link
        href="/admin"
        className="inline-block rounded-md border-[1.5px] border-red bg-card px-4 py-2 font-sans text-[13px] font-semibold text-red transition hover:bg-red hover:text-card"
      >
        ← Tilbake til admin
      </Link>

      <h1 className="mt-5 font-display text-[28px] text-ink">
        {isNew ? "Ny annonse" : "Rediger annonse"}
      </h1>

      <form onSubmit={handleSave} className="folk-card mt-6 p-6 sm:p-8">
        <label htmlFor="title" className={labelClass}>
          Tittel
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className={inputClass}
          placeholder="F.eks. «Kaninunger til salgs»"
        />

        <label htmlFor="slug" className={`${labelClass} mt-4`}>
          URL (slug)
        </label>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-body text-[14px] text-unit">/a/</span>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugEdited(true);
            }}
            className="w-full rounded-md border-[1.5px] border-red bg-card px-4 py-3 font-body text-ink outline-none focus:border-barn focus:ring-2 focus:ring-[#c8912e55]"
            placeholder="kaninunger"
          />
        </div>

        <label htmlFor="description" className={`${labelClass} mt-4`}>
          Kort tekst
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} resize-none`}
          placeholder="Beskriv varen kort …"
        />

        <label htmlFor="category" className={`${labelClass} mt-4`}>
          Kategori / enhet{" "}
          <span className="normal-case text-unit">(valgfritt)</span>
        </label>
        <input
          id="category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass}
          placeholder="f.eks. «12-kartong», «pr. stk»"
        />

        <label htmlFor="rtype" className={`${labelClass} mt-4`}>
          Reservasjonstype
        </label>
        <select
          id="rtype"
          value={reservationType}
          onChange={(e) =>
            setReservationType(e.target.value as ReservationType)
          }
          className={inputClass}
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
            <label htmlFor="options" className={`${labelClass} mt-4`}>
              Antall-valg (kommaseparert)
            </label>
            <input
              id="options"
              type="text"
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              className={inputClass}
              placeholder="6, 12, 24"
            />
          </>
        )}

        <label htmlFor="count" className={`${labelClass} mt-4`}>
          Antall tilgjengelig (lager)
        </label>
        <input
          id="count"
          type="number"
          min={0}
          value={availableCount}
          onChange={(e) => setAvailableCount(Number(e.target.value))}
          className={inputClass}
        />

        <label htmlFor="price" className={`${labelClass} mt-4`}>
          Pris i kr <span className="normal-case text-unit">(valgfritt)</span>
        </label>
        <input
          id="price"
          type="number"
          min={0}
          step="0.01"
          value={priceText}
          onChange={(e) => setPriceText(e.target.value)}
          className={inputClass}
          placeholder="F.eks. 65"
        />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="sort" className={labelClass}>
              Rekkefølge
            </label>
            <input
              id="sort"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 py-3">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-5 w-5 rounded border-red text-barn focus:ring-barn"
              />
              <span className="font-sans text-[13px] font-semibold text-body">
                Publisert (synlig)
              </span>
            </label>
          </div>
        </div>

        {/* Bilde */}
        <div className="mt-4">
          <span className={labelClass}>Bilde</span>
          <div className="mt-2 flex items-center gap-4">
            {imageUrl && (
              <div className="relative h-20 w-20 overflow-hidden rounded-[4px] shadow-[inset_0_0_0_2px_#8e2323]">
                <Image
                  src={imageUrl}
                  alt="Forhåndsvisning"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            )}
            <label className="cursor-pointer rounded-md border-[1.5px] border-red bg-card px-4 py-2.5 font-sans text-[13px] font-semibold text-red transition hover:bg-red hover:text-card">
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
                className="font-sans text-[13px] font-semibold text-barn hover:underline"
              >
                Fjern
              </button>
            )}
          </div>
        </div>

        {message && (
          <p className="mt-5 rounded-md border border-gold bg-[#f2e3b6] px-4 py-3 font-body text-sm text-ink">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || uploading}
          className="mt-6 w-full rounded-[7px] bg-barn px-6 py-4 font-display text-[17px] text-card shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_10px_20px_-12px_rgba(140,40,25,.8)] transition hover:bg-barn-hover active:scale-[.98] disabled:opacity-70"
        >
          {saving
            ? "Lagrer …"
            : isNew
              ? "Opprett annonse"
              : "Lagre endringer"}
        </button>
      </form>

      {/* QR per annonse */}
      {!isNew && (
        <section className="folk-card mt-8 p-6 sm:p-8">
          <h2 className="font-display text-[22px] text-ink">
            QR-kode til denne annonsen
          </h2>
          <p className="mb-6 mt-1 font-body text-[14px] italic text-muted">
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
