export default function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 py-3.5 text-[15px] font-bold text-slate-950 shadow-[0_6px_18px_-6px_rgba(245,158,11,0.5)] transition active:scale-[0.97] disabled:opacity-60 ${className}`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/40" />
      <span className="relative flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}
