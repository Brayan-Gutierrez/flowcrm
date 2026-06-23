import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea un número como moneda (MXN por defecto). */
export function formatCurrency(value: number, currency = "MXN", locale = "es-MX") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Formatea un número compacto, ej. 12.4k */
export function formatCompact(value: number, locale = "es-MX") {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Formatea un porcentaje. */
export function formatPercent(value: number, locale = "es-MX") {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value / 100);
}

/** Devuelve las iniciales de un nombre. */
export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

/** Genera un id pseudo-único sin dependencias. */
export function uid(prefix = "id") {
  return `${prefix}_${Math.abs(hashString(prefix + performanceNow())).toString(36)}${Math.floor(
    seededRandom() * 1e6,
  ).toString(36)}`;
}

// Helpers internos para evitar Date.now()/Math.random no determinista en SSR hydration.
let _seed = 0x2f6e2b1;
function seededRandom() {
  _seed = (_seed * 1103515245 + 12345) & 0x7fffffff;
  return _seed / 0x7fffffff;
}
function performanceNow() {
  if (typeof performance !== "undefined") return performance.now();
  return 0;
}
function hashString(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}
