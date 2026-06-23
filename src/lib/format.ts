// Utilidades de fecha basadas en date-fns con locale español.
import { format, formatDistanceToNow, isPast, isToday } from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return format(new Date(iso), "d MMM yyyy", { locale: es });
}

export function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return format(new Date(iso), "d MMM yyyy · HH:mm", { locale: es });
}

export function fromNow(iso: string | null | undefined) {
  if (!iso) return "—";
  return formatDistanceToNow(new Date(iso), { locale: es, addSuffix: true });
}

export function isOverdue(iso: string) {
  const d = new Date(iso);
  return isPast(d) && !isToday(d);
}

export function relativeDayLabel(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return "Hoy";
  return format(d, "EEEE d 'de' MMMM", { locale: es });
}
