const time = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const dayMonth = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });
const full = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric" });

// "27 de out. de 2026" -> "27 out 2026"
const clean = (text: string) => text.replaceAll(" de ", " ").replace(".", "");

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export const formatTime = (iso: string) => time.format(new Date(iso));
export const formatDate = (iso: string) => clean(full.format(new Date(iso)));

// 0 = hoje, 1 = ontem, negativo = futuro
export function daysFromToday(iso: string) {
  return Math.round((startOfDay(new Date()) - startOfDay(new Date(iso))) / 86_400_000);
}

export function formatSendTime(iso: string) {
  const diff = daysFromToday(iso);
  if (diff === 0) return `Hoje · ${formatTime(iso)}`;
  if (diff === 1) return `Ontem · ${formatTime(iso)}`;
  return `${clean(dayMonth.format(new Date(iso)))} · ${formatTime(iso)}`;
}