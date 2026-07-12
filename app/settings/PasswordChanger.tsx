"use client";

import { useState, useTransition } from "react";
import { changePassword } from "@/lib/actions/auth";

export default function PasswordChanger() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (password.length < 6) {
      setMessage("Password should be at least 6 characters");
      return;
    }
    startTransition(async () => {
      const result = await changePassword(password);
      if (result?.error) setMessage(result.error);
      else {
        setMessage("Password updated ✓");
        setPassword("");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="mb-2 text-sm font-bold text-slate-400">Change password</h2>
      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base focus:border-amber-500 focus:outline-none"
      />
      {message && <p className="mb-2 text-xs text-amber-400">{message}</p>}
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full rounded-xl bg-slate-800 py-3 text-sm font-bold text-slate-200 disabled:opacity-60"
      >
        {isPending ? "Updating..." : "Update password"}
      </button>
    </section>
  );
}
