export function formatRs(n: number) {
  return "Rs. " + Number(n || 0).toLocaleString("en-LK", { maximumFractionDigits: 2 });
}

export function formatKg(n: number) {
  return Number(n || 0).toLocaleString("en-LK", { maximumFractionDigits: 1 }) + " kg";
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateDisplay(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-LK", { day: "2-digit", month: "short", year: "numeric" });
}
