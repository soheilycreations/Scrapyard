export default function ReadoutCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn";
}) {
  const styles = {
    neutral: { bg: "bg-slate-950/70", border: "border-slate-800/60", text: "text-slate-50", label: "text-slate-500" },
    good: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", label: "text-emerald-400/60" },
    warn: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", label: "text-amber-400/60" },
  }[tone];

  return (
    <div className={`rounded-2xl border ${styles.border} ${styles.bg} px-3.5 py-3`}>
      <p className={`text-[10px] font-semibold uppercase tracking-wider ${styles.label}`}>{label}</p>
      <p className={`font-mono text-base font-extrabold tabular-nums ${styles.text}`}>{value}</p>
    </div>
  );
}
