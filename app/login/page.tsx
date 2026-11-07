"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (email.trim().toLowerCase() !== process.env.NEXT_PUBLIC_PREY_OWNER_EMAIL?.toLowerCase()) {
      setError("This account is not authorized.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (authError) {
      setError("Sign-in failed. Check your email and password.");
      return;
    }
    window.location.href = "/";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07152F] px-4 text-white">
      <form onSubmit={signIn} className="w-full max-w-md rounded-2xl border border-yellow-400/30 bg-[#102448] p-8 shadow-xl">
        <h1 className="text-3xl font-black tracking-widest text-yellow-400">PREY</h1>
        <p className="mt-1 text-xs tracking-wider text-slate-400">PRIVATE AI LAB ACCESS</p>
        <h2 className="mt-8 text-xl font-semibold">Sign in</h2>
        <label className="mt-5 block text-sm text-slate-300">Email</label>
        <input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-600 bg-[#07152F] px-3 py-3 outline-none focus:border-yellow-400" />
        <label className="mt-4 block text-sm text-slate-300">Password</label>
        <input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-600 bg-[#07152F] px-3 py-3 outline-none focus:border-yellow-400" />
        {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
        <button disabled={loading} className="mt-6 w-full rounded-lg bg-yellow-400 px-4 py-3 font-bold text-[#07152F] disabled:opacity-50">{loading ? "Signing in..." : "Sign in securely"}</button>
      </form>
    </main>
  );
}
