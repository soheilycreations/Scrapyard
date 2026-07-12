"use client";

import { useRouter } from "next/navigation";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function ReportControls({
  mode,
  date,
  year,
  month,
}: {
  mode: string;
  date: string;
  year: number;
  month: number;
}) {
  const router = useRouter();

  function setMode(m: string) {
    if (m === "daily") router.push(`/reports?mode=daily&date=${date}`);
    else router.push(`/reports?mode=monthly&year=${year}&month=${month}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex rounded-xl border border-slate-800 bg-slate-900 p-1">
        <button
          onClick={() => setMode("daily")}
          className={`flex-1 rounded-lg py-2 text-sm font-bold ${
            mode === "daily" ? "bg-amber-500 text-slate-950" : "text-slate-400"
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setMode("monthly")}
          className={`flex-1 rounded-lg py-2 text-sm font-bold ${
            mode === "monthly" ? "bg-amber-500 text-slate-950" : "text-slate-400"
          }`}
        >
          Monthly
        </button>
      </div>

      {mode === "daily" ? (
        <input
          type="date"
          value={date}
          onChange={(e) => router.push(`/reports?mode=daily&date=${e.target.value}`)}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-base focus:border-amber-500 focus:outline-none"
        />
      ) : (
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => router.push(`/reports?mode=monthly&year=${year}&month=${e.target.value}`)}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-base focus:border-amber-500 focus:outline-none"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => router.push(`/reports?mode=monthly&year=${e.target.value}&month=${month}`)}
            className="w-28 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-base focus:border-amber-500 focus:outline-none"
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
