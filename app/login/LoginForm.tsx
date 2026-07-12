"use client";

import { useState, useTransition } from "react";
import { login } from "@/lib/actions/auth";
import PrimaryButton from "@/components/PrimaryButton";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await login(email, password);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label className="mb-1 block text-sm text-slate-400">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-base text-slate-100 focus:border-amber-500 focus:outline-none"
          placeholder="owner@yourshop.lk"
          autoComplete="email"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-400">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-base text-slate-100 focus:border-amber-500 focus:outline-none"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-950 border border-red-800 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <PrimaryButton type="submit" disabled={isPending} className="py-4 text-base">
        {isPending ? "Logging in..." : "Login"}
      </PrimaryButton>
    </form>
  );
}
