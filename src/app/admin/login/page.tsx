"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
    <main className="flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-8 shadow-sm"
      >
        <div className="mb-6 text-center">
          <span className="text-4xl">🔒</span>
          <h1 className="mt-3 text-2xl font-bold text-stone-800">Admin</h1>
          <p className="mt-1 text-sm text-stone-500">
            Logg inn for å styre eggsalget.
          </p>
        </div>

        <label htmlFor="email" className="text-sm font-medium text-stone-700">
          E-post
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 mb-4 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        />

        <label htmlFor="password" className="text-sm font-medium text-stone-700">
          Passord
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        />

        {error && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-amber-500 px-6 py-3 font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
        >
          {loading ? "Logger inn …" : "Logg inn"}
        </button>
      </form>
    </main>
  );
}
