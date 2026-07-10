"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ReservationType } from "@/lib/types";

const ERROR_TEXT: Record<string, string> = {
  not_enough: "Beklager, det er ikke nok igjen til dette antallet.",
  invalid_quantity: "Ugyldig antall.",
  missing_fields: "Fyll inn navn og telefonnummer.",
  not_found: "Denne annonsen er ikke tilgjengelig lenger.",
  network: "Noe gikk galt. Prøv igjen om litt.",
};

export default function ReservationForm({
  listingId,
  reservationType,
  quantityOptions,
  availableCount,
}: {
  listingId: string;
  reservationType: ReservationType;
  quantityOptions: number[];
  availableCount: number;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  // Startverdi for antall avhengig av type
  const fixedOptions = quantityOptions.filter((q) => q <= availableCount);
  const [quantity, setQuantity] = useState<number>(
    reservationType === "single" ? 1 : reservationType === "free" ? 1 : 0
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (reservationType === "fixed" && !quantity) {
      setError("Velg hvor mange du vil reservere.");
      return;
    }
    if (reservationType === "free" && (quantity < 1 || quantity > availableCount)) {
      setError(`Velg et antall mellom 1 og ${availableCount}.`);
      return;
    }

    setStatus("sending");
    const supabase = createClient();

    const { data, error: rpcError } = await supabase.rpc("make_reservation", {
      p_listing_id: listingId,
      p_name: name.trim(),
      p_phone: phone.trim(),
      p_quantity: reservationType === "single" ? 1 : quantity,
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

    setStatus("done");
    router.refresh();
  }

  if (status === "done") {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <p className="text-4xl">✅</p>
        <h2 className="mt-3 text-2xl font-bold text-emerald-800">
          Reservasjonen er mottatt!
        </h2>
        <p className="mt-2 text-emerald-700">
          Takk, {name.split(" ")[0] || "og velkommen"}. Vi legger det klar til
          deg.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-xl font-bold text-stone-800">Reserver</h2>
      <p className="mt-1 text-sm text-stone-500">
        Fyll inn skjemaet, så holder vi av til deg.
      </p>

      {/* Antall */}
      {reservationType === "fixed" && (
        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-stone-700">
            Hvor mange?
          </legend>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {fixedOptions.map((q) => (
              <button
                type="button"
                key={q}
                onClick={() => setQuantity(q)}
                className={`rounded-2xl border px-4 py-4 text-center transition ${
                  quantity === q
                    ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500"
                    : "border-stone-200 hover:border-amber-300"
                }`}
              >
                <span className="block text-2xl font-bold text-stone-800">
                  {q}
                </span>
                <span className="text-xs text-stone-400">stk</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {reservationType === "free" && (
        <div className="mt-6">
          <label
            htmlFor="quantity"
            className="text-sm font-medium text-stone-700"
          >
            Hvor mange? (maks {availableCount})
          </label>
          <input
            id="quantity"
            type="number"
            min={1}
            max={availableCount}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 text-lg outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          />
        </div>
      )}

      {reservationType === "single" && (
        <p className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-stone-600">
          Du reserverer <strong>1 stk</strong>.
        </p>
      )}

      {/* Navn */}
      <div className="mt-5">
        <label htmlFor="name" className="text-sm font-medium text-stone-700">
          Navn
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          placeholder="Ola Nordmann"
        />
      </div>

      {/* Telefon */}
      <div className="mt-4">
        <label htmlFor="phone" className="text-sm font-medium text-stone-700">
          Telefon
        </label>
        <input
          id="phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          placeholder="123 45 678"
        />
      </div>

      {/* Melding */}
      <div className="mt-4">
        <label htmlFor="note" className="text-sm font-medium text-stone-700">
          Melding <span className="text-stone-400">(valgfritt)</span>
        </label>
        <textarea
          id="note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 w-full resize-none rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          placeholder="F.eks. «Henter ca. kl. 18»"
        />
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 w-full rounded-2xl bg-amber-500 px-6 py-4 text-lg font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Sender …" : "Reserver"}
      </button>
    </form>
  );
}
