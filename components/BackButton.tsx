"use client";

import { useRouter } from "next/navigation";
import { BackIcon } from "./icons";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      aria-label="Back"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition active:scale-95 hover:border-slate-700"
    >
      <BackIcon size={18} strokeWidth={2.5} />
    </button>
  );
}
