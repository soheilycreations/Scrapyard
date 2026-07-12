"use client";

import { logout } from "@/lib/actions/auth";
import { useTransition } from "react";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-900 bg-red-950/40 py-3.5 text-sm font-bold text-red-300 transition active:scale-[0.98] hover:bg-red-950/60"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
      {isPending ? "Logging out..." : "Logout"}
    </button>
  );
}
