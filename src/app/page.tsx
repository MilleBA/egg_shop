import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Availability } from "@/lib/types";
import ReservationForm from "@/components/ReservationForm";

// Ikke cache – vi vil alltid vise ferskt antall egg.
export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("availability")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle<Availability>();

  const available = data?.available_count ?? 0;
  const soldOut = available <= 0;

  return (
    <main className="min-h-screen w-full">
      {/* Topp / hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-50 via-[#fffdf7] to-[#fffdf7]" />
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 pt-16 pb-8 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800">
            🥚 Gårdsegg
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-stone-800 sm:text-5xl">
            Ferske egg til salgs
          </h1>
          <p className="mt-3 max-w-md text-stone-500">
            Fra våre 10 høner. Reserver enkelt her, så legger jeg dem klar til
            deg.
          </p>
        </div>
      </section>

      {/* Statuskort */}
      <section className="mx-auto max-w-2xl px-6">
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          {data?.image_url && (
            <div className="relative aspect-[16/10] w-full bg-stone-100">
              <Image
                src={data.image_url}
                alt="Dagens egg"
                fill
                sizes="(max-width: 672px) 100vw, 672px"
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="p-6 sm:p-8">
            {soldOut ? (
              <div className="text-center">
                <p className="text-sm font-medium uppercase tracking-wide text-stone-400">
                  Status i dag
                </p>
                <p className="mt-2 text-3xl font-bold text-stone-700">
                  Utsolgt 😴
                </p>
                <p className="mt-2 text-stone-500">
                  Kom tilbake senere – hønene jobber med saken.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-medium uppercase tracking-wide text-stone-400">
                  Tilgjengelig i dag
                </p>
                <p className="mt-2 text-5xl font-bold text-amber-600">
                  {available}
                  <span className="ml-2 text-2xl font-medium text-stone-400">
                    egg
                  </span>
                </p>
              </div>
            )}

            {data?.note && (
              <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-center text-stone-600">
                {data.note}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Reservasjon */}
      <section className="mx-auto max-w-2xl px-6 py-8">
        {!soldOut && <ReservationForm maxAvailable={available} />}
      </section>

      <footer className="mx-auto max-w-2xl px-6 pb-10 text-center text-sm text-stone-400">
        Takk for at du handler lokalt 💛
      </footer>
    </main>
  );
}
