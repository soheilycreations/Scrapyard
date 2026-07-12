import Link from "next/link";
import Image from "next/image";
import BackButton from "./BackButton";

export default function PageHeader({
  title,
  subtitle,
  action,
  showLogo,
  back,
  rightSlot,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
  showLogo?: boolean;
  back?: boolean;
  rightSlot?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur px-4 py-3">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {back && <BackButton />}
          {showLogo && (
            <Image src="/logo.png" alt="ScrapYard" width={32} height={32} className="rounded-md shrink-0" />
          )}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-50">{title}</h1>
            {subtitle && <p className="truncate text-xs text-slate-400">{subtitle}</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {rightSlot}
          {action && (
            <Link
              href={action.href}
              className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950"
            >
              {action.label}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
