const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Relative dates in the mock-up's style: « il y a 5 min », « hier », « il y a 3 j ». */
export function timeAgo(date: string | Date, now: Date = new Date()) {
  const elapsed = now.getTime() - new Date(date).getTime();

  if (elapsed < MINUTE) return "à l’instant";
  if (elapsed < HOUR) return `il y a ${Math.round(elapsed / MINUTE)} min`;
  if (elapsed < DAY) return `il y a ${Math.round(elapsed / HOUR)} h`;

  const days = Math.round(elapsed / DAY);
  if (days === 1) return "hier";
  if (days < 30) return `il y a ${days} j`;
  return `le ${formatDate(date)}`;
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

export const formatDate = (date: string | Date) => dateFormatter.format(new Date(date));
export const formatDateTime = (date: string | Date) => dateTimeFormatter.format(new Date(date));

const numberFormatter = new Intl.NumberFormat("fr-FR");
export const formatNumber = (value: number) => numberFormatter.format(value);

export const plural = (count: number, singular: string, pluralForm = `${singular}s`) =>
  `${formatNumber(count)} ${count > 1 ? pluralForm : singular}`;

export const initials = (name: string) =>
  name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
