"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Divider from "@/components/Divider";

const inputClass =
  "mt-1 w-full rounded-md border-[1.5px] border-red bg-card px-4 py-3 font-body text-ink outline-none focus:border-barn focus:ring-2 focus:ring-[#c8912e55]";
const labelClass =
  "block font-sans text-[12px] font-semibold uppercase tracking-[.06em] text-muted";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setLoading(false);
      setError("Feil e-post eller passord.");
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-10">
      <form
        onSubmit={handleLogin}
        className="folk-card animate-scrin w-full max-w-sm p-8"
      >
        <div className="mb-5 text-center">
          <h1 className="font-display text-[28px] text-ink">Admin</h1>
          <Divider rules={false} className="mt-3" />
          <p className="mt-3 font-body text-[14px] italic text-muted">
            Logg inn for å styre gårdsbutikken.
          </p>
        </div>

        <label htmlFor="email" className={labelClass}>
          E-post
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${inputClass} mb-4`}
        />

        <label htmlFor="password" className={labelClass}>
          Passord
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />

        {error && (
          <p className="mt-4 rounded-md border border-[#8f4032] bg-[#edd8cc] px-4 py-3 font-sans text-sm text-[#8f4032]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-[7px] bg-barn px-6 py-3.5 font-display text-[17px] text-card shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_10px_20px_-12px_rgba(140,40,25,.8)] transition hover:bg-barn-hover active:scale-[.98] disabled:opacity-70"
        >
          {loading ? "Logger inn …" : "Logg inn"}
        </button>
      </form>
    </main>
  );
}
