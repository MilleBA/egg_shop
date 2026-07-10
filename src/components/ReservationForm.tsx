"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { priceLabel } from "@/lib/stock";
import type { ReservationType } from "@/lib/types";
import Divider from "@/components/Divider";

const ERROR_TEXT: Record<string, string> = {
  not_enough: "Beklager, det er ikke nok igjen til dette antallet.",
  invalid_quantity: "Ugyldig antall.",
  missing_fields: "Fyll inn navn og telefonnummer.",
  not_found: "Denne annonsen er ikke tilgjengelig lenger.",
  network: "Noe gikk galt. Prøv igjen om litt.",
};

const inputClass =
  "mt-1 w-full rounded-md border-[1.5px] border-red bg-card px-4 py-3 font-body text-ink outline-none focus:border-barn focus:ring-2 focus:ring-[#c8912e55]";

const labelClass = "block font-sans text-[12px] font-semibold uppercase tracking-[.06em] text-muted";

const stepBtn =
  "flex h-10 w-10 items-center justify-center rounded-md border-[1.5px] border-red bg-card text-[22px] leading-none text-red transition active:bg-[#e7dcc2]";

export default function ReservationForm({
  listingId,
  title,
  reservationType,
  quantityOptions,
  availableCount,
  price,
}: {
  listingId: string;
  title: string;
  reservationType: ReservationType;
  quantityOptions: number[];
  availableCount: number;
  price: number | null;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [doneInfo, setDoneInfo] = useState<{ qty: number; total: string | null }>(
    { qty: 0, total: null }
  );

  const fixedOptions = quantityOptions.filter((q) => q <= availableCount);
  const [quantity, setQuantity] = useState<number>(
    reservationType === "single" || reservationType === "free" ? 1 : 0
  );

  const effectiveQty = reservationType === "single" ? 1 : quantity;
  const totalLabel = price != null ? `${price * effectiveQty} kr` : null;
  const showPriceRow = price != null || reservationType === "free";

  function inc() {
    setQuantity((q) => Math.min(availableCount, q + 1));
  }
  function dec() {
    setQuantity((q) => Math.max(1, q - 1));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (reservationType === "fixed" && !quantity) {
      setError("Velg hvor mange du vil reservere.");
      return;
    }
    if (
      reservationType === "free" &&
      (quantity < 1 || quantity > availableCount)
    ) {
      setError(`Velg et antall mellom 1 og ${availableCount}.`);
      return;
    }

    setStatus("sending");
    const supabase = createClient();

    const { data, error: rpcError } = await supabase.rpc("make_reservation", {
      p_listing_id: listingId,
      p_name: name.trim(),
      p_phone: phone.trim(),
      p_quantity: effectiveQty,
      p_note: note.trim() || null,
    });

    if (rpcError) {
      setStatus("idle");
      setError(ERROR_TEXT.network);
      return;
    }

    const result = data as { ok: boolean; error?: string };
    if (!result?.ok) {
      setStatus("idle");
      setError(ERROR_TEXT[result?.error ?? "network"] ?? ERROR_TEXT.network);
      router.refresh();
      return;
    }

    setDoneInfo({ qty: effectiveQty, total: totalLabel });
    setStatus("done");
  }

  // ---- Bekreftelse ----
  if (status === "done") {
    return (
      <div className="animate-scrin flex flex-col items-center px-2 py-8 text-center">
        <div className="animate-popin flex h-[84px] w-[84px] items-center justify-center rounded-full bg-red text-[38px] text-goldtext shadow-[0_0_0_4px_#f2e7ce,0_0_0_6px_#c8912e,0_0_0_8px_#3e5d42]">
          ✓
        </div>
        <h2 className="mb-2 mt-6 font-display text-[32px] text-ink">
          Reservert!
        </h2>
        <Divider rules={false} className="mb-4" />
        <p className="mb-6 max-w-[250px] font-body text-[14px] text-muted">
          Vi legger det klart. Hent på gården innen 2 dager 💛
        </p>
        <div className="folk-card flex w-full items-center justify-between px-5 py-4">
          <div className="text-left">
            <div className="font-display text-[19px] text-ink">{title}</div>
            <div className="font-body text-[13px] italic text-unit">
              Antall: {doneInfo.qty}
            </div>
          </div>
          {doneInfo.total && (
            <div className="font-display text-[19px] text-barn">
              {doneInfo.total}
            </div>
          )}
        </div>
        <button
          onClick={() => {
            router.push("/");
            router.refresh();
          }}
          className="mt-6 w-full rounded-[7px] border-[1.5px] border-red bg-transparent px-6 py-3.5 font-display text-[16px] text-red transition hover:bg-red hover:text-card"
        >
          Tilbake til butikken
        </button>
      </div>
    );
  }

  // ---- Reservasjonspanel ----
  return (
    <form onSubmit={handleSubmit}>
      {showPriceRow && (
        <div className="mb-4 flex items-center justify-between border-y border-[rgba(200,145,46,.6)] py-4">
          {price != null ? (
            <span className="font-display text-[28px] text-barn">
              {priceLabel(price)}
            </span>
          ) : (
            <span className="font-body text-[15px] italic text-muted">
              Velg antall
            </span>
          )}

          {reservationType === "free" && (
            <div className="flex items-center gap-2">
              <button type="button" onClick={dec} className={stepBtn} aria-label="Færre">
                −
              </button>
              <span className="min-w-[32px] text-center font-display text-[22px] text-ink">
                {quantity}
              </span>
              <button type="button" onClick={inc} className={stepBtn} aria-label="Flere">
                +
              </button>
            </div>
          )}
        </div>
      )}

      {/* Faste valg */}
      {reservationType === "fixed" && (
        <div className="mb-4 grid grid-cols-3 gap-2.5">
          {fixedOptions.map((q) => {
            const selected = quantity === q;
            return (
              <button
                type="button"
                key={q}
                onClick={() => setQuantity(q)}
                className={`rounded-md border-[1.5px] border-red py-3 text-center font-display text-[20px] transition active:scale-[.98] ${
                  selected ? "bg-red text-card" : "bg-card text-ink"
                }`}
              >
                {q}
              </button>
            );
          })}
        </div>
      )}

      {reservationType === "single" && (
        <p className="mb-4 rounded-md border-[1.5px] border-red bg-card px-4 py-2.5 font-body text-[14px] text-body">
          Du reserverer <strong className="text-ink">1 stk</strong>.
        </p>
      )}

      {/* Kontaktfelt */}
      <label htmlFor="name" className={labelClass}>
        Navn
      </label>
      <input
        id="name"
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={inputClass}
        placeholder="Ola Nordmann"
      />

      <label htmlFor="phone" className={`${labelClass} mt-3`}>
        Telefon
      </label>
      <input
        id="phone"
        type="tel"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className={inputClass}
        placeholder="123 45 678"
      />

      <label htmlFor="note" className={`${labelClass} mt-3`}>
        Melding <span className="normal-case text-unit">(valgfritt)</span>
      </label>
      <textarea
        id="note"
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className={`${inputClass} resize-none`}
        placeholder="F.eks. «Henter ca. kl. 18»"
      />

      {error && (
        <p className="mt-3 rounded-md border border-[#8f4032] bg-[#edd8cc] px-4 py-3 font-sans text-sm text-[#8f4032]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-4 w-full rounded-[7px] bg-barn px-6 py-4 font-display text-[18px] tracking-[.02em] text-card shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_10px_20px_-12px_rgba(140,40,25,.8)] transition hover:bg-barn-hover active:scale-[.98] disabled:opacity-70"
      >
        {status === "sending"
          ? "Sender …"
          : totalLabel
            ? `Reserver · ${totalLabel}`
            : "Reserver"}
      </button>
    </form>
  );
}
