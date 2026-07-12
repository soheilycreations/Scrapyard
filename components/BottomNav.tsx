"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, TruckIcon, LedgerIcon, StockIcon, CalendarIcon } from "./icons";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", Icon: HomeIcon },
  { href: "/loads/new", label: "Load Add", Icon: TruckIcon },
  { href: "/suppliers", label: "Suppliers", Icon: LedgerIcon },
  { href: "/stock", label: "Stock", Icon: StockIcon },
  { href: "/reports", label: "Reports", Icon: CalendarIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+14px)]">
      <div className="mx-auto flex max-w-xs items-center justify-between rounded-full border border-slate-800 bg-slate-900/95 px-2 py-2 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.6)] backdrop-blur">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${
                active
                  ? "bg-amber-500 text-slate-950 shadow-[0_4px_12px_-2px_rgba(245,158,11,0.6)]"
                  : "text-slate-500"
              }`}
            >
              <Icon size={19} strokeWidth={active ? 2.4 : 2} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
