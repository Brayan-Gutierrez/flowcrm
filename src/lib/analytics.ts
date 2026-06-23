// ============================================================
// FlowCRM — Cálculos de analítica para Dashboard y Reportes
// ============================================================
import {
  LEAD_SOURCE_LABEL,
  PIPELINE_STAGES,
  type CrmData,
  type LeadSource,
  type Quote,
} from "./types";

const MONTHS_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const DAY = 1000 * 60 * 60 * 24;

// "Hoy" fijo del entorno demo (coherente con los datos semilla).
export const APP_TODAY = new Date("2026-06-22T12:00:00.000Z");

export type PeriodPreset = "1m" | "6m" | "12m" | "custom";

export const PERIOD_LABEL: Record<PeriodPreset, string> = {
  "1m": "Último mes",
  "6m": "Últimos 6 meses",
  "12m": "Últimos 12 meses",
  custom: "Personalizado",
};

export interface DateRange {
  from: Date;
  to: Date;
}

/** Calcula el rango [from, to] a partir del preset o fechas personalizadas. */
export function getPeriodRange(
  preset: PeriodPreset,
  customFrom?: string,
  customTo?: string,
  ref: Date = APP_TODAY,
): DateRange {
  if (preset === "custom") {
    const to = customTo ? new Date(customTo) : ref;
    const from = customFrom
      ? new Date(customFrom)
      : new Date(to.getFullYear(), to.getMonth() - 1, to.getDate());
    return { from, to };
  }
  const months = preset === "1m" ? 1 : preset === "12m" ? 12 : 6;
  const from = new Date(ref);
  from.setMonth(from.getMonth() - months);
  return { from, to: ref };
}

/** Filtra el dataset al rango indicado (por fecha de creación / cierre). */
export function filterCrmByRange(data: CrmData, range: DateRange): CrmData {
  const lo = range.from.getTime();
  const hi = range.to.getTime();
  const inRange = (iso: string) => {
    const t = new Date(iso).getTime();
    return t >= lo && t <= hi;
  };
  return {
    users: data.users,
    prospects: data.prospects.filter((p) => inRange(p.createdAt)),
    clients: data.clients.filter((c) => inRange(c.createdAt)),
    // Una oportunidad cuenta si se creó O se cerró dentro del periodo.
    opportunities: data.opportunities.filter(
      (o) =>
        inRange(o.createdAt) ||
        ((o.stage === "ganada" || o.stage === "perdida") &&
          inRange(o.expectedCloseDate)),
    ),
    activities: data.activities.filter((a) => inRange(a.createdAt)),
    quotes: data.quotes.filter((q) => inRange(q.createdAt)),
  };
}

/**
 * Serie de ventas adaptada al rango: semanal si el periodo es corto
 * (≤ 45 días), mensual en periodos largos. Agrupa las oportunidades
 * ganadas por su fecha de cierre.
 */
export function getSalesTrend(data: CrmData, range: DateRange) {
  const { from, to } = range;
  const spanDays = (to.getTime() - from.getTime()) / DAY;
  const monthlyMeta = 600000;
  const won = data.opportunities.filter((o) => o.stage === "ganada");

  type Bucket = {
    label: string;
    start: number;
    end: number;
    ganadas: number;
    meta: number;
  };
  const buckets: Bucket[] = [];

  if (spanDays <= 45) {
    // Semanal
    let start = new Date(from);
    while (start.getTime() < to.getTime()) {
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      buckets.push({
        label: `${start.getDate()} ${MONTHS_ES[start.getMonth()]}`,
        start: start.getTime(),
        end: Math.min(end.getTime(), to.getTime()),
        ganadas: 0,
        meta: Math.round((monthlyMeta * 7) / 30),
      });
      start = end;
    }
  } else {
    // Mensual
    const multiYear = from.getFullYear() !== to.getFullYear();
    let d = new Date(from.getFullYear(), from.getMonth(), 1);
    const last = new Date(to.getFullYear(), to.getMonth(), 1);
    while (d.getTime() <= last.getTime()) {
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      buckets.push({
        label:
          MONTHS_ES[d.getMonth()] +
          (multiYear ? ` ${String(d.getFullYear()).slice(2)}` : ""),
        start: d.getTime(),
        end: end.getTime(),
        ganadas: 0,
        meta: monthlyMeta,
      });
      d = end;
    }
  }

  won.forEach((o) => {
    const t = new Date(o.expectedCloseDate).getTime();
    const b = buckets.find((x) => t >= x.start && t < x.end);
    if (b) b.ganadas += o.value;
  });

  return buckets.map(({ label, ganadas, meta }) => ({ label, ganadas, meta }));
}

// Totales de una cotización
export function quoteTotals(quote: Pick<Quote, "items" | "taxRate">) {
  const subtotal = quote.items.reduce(
    (sum, it) => sum + it.quantity * it.unitPrice,
    0,
  );
  const tax = subtotal * (quote.taxRate / 100);
  return { subtotal, tax, total: subtotal + tax };
}

// ---------- KPIs principales ----------
export function getKpis(data: CrmData) {
  const won = data.opportunities.filter((o) => o.stage === "ganada");
  const lost = data.opportunities.filter((o) => o.stage === "perdida");
  const open = data.opportunities.filter(
    (o) => o.stage !== "ganada" && o.stage !== "perdida",
  );

  const wonValue = won.reduce((s, o) => s + o.value, 0);
  const pipelineValue = open.reduce((s, o) => s + o.value, 0);
  const weightedPipeline = open.reduce(
    (s, o) => s + o.value * (o.probability / 100),
    0,
  );

  const closedCount = won.length + lost.length;
  const winRate = closedCount > 0 ? (won.length / closedCount) * 100 : 0;

  const convertedProspects = data.prospects.filter(
    (p) => p.status === "convertido",
  ).length;
  const conversionRate =
    data.prospects.length > 0
      ? (convertedProspects / data.prospects.length) * 100
      : 0;

  const avgDeal = won.length > 0 ? wonValue / won.length : 0;

  return {
    wonValue,
    pipelineValue,
    weightedPipeline,
    winRate,
    conversionRate,
    avgDeal,
    activeProspects: data.prospects.filter(
      (p) => p.status !== "convertido" && p.status !== "perdido",
    ).length,
    totalClients: data.clients.length,
    openOpportunities: open.length,
    pendingActivities: data.activities.filter((a) => !a.completed).length,
  };
}

// ---------- Funnel de ventas ----------
export function getFunnel(data: CrmData) {
  return PIPELINE_STAGES.filter(
    (s) => s.id !== "ganada" && s.id !== "perdida",
  )
    .concat(PIPELINE_STAGES.filter((s) => s.id === "ganada"))
    .map((stage) => {
      const items = data.opportunities.filter((o) => o.stage === stage.id);
      return {
        stage: stage.id,
        label: stage.label,
        color: stage.color,
        count: items.length,
        value: items.reduce((s, o) => s + o.value, 0),
      };
    });
}

// ---------- Ventas por mes (últimos 6 meses) ----------
export function getMonthlySales(data: CrmData, refDate = new Date("2026-06-22")) {
  const buckets: { key: string; label: string; ganadas: number; meta: number }[] =
    [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: MONTHS_ES[d.getMonth()],
      ganadas: 0,
      meta: 600000,
    });
  }
  const map = new Map(buckets.map((b) => [b.key, b]));
  data.opportunities
    .filter((o) => o.stage === "ganada")
    .forEach((o) => {
      const d = new Date(o.expectedCloseDate);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const b = map.get(key);
      if (b) b.ganadas += o.value;
    });
  return buckets;
}

// ---------- Ranking de ejecutivos ----------
export function getExecutiveRanking(data: CrmData) {
  return data.users
    .map((u) => {
      const won = data.opportunities.filter(
        (o) => o.ownerId === u.id && o.stage === "ganada",
      );
      const open = data.opportunities.filter(
        (o) =>
          o.ownerId === u.id &&
          o.stage !== "ganada" &&
          o.stage !== "perdida",
      );
      const wonValue = won.reduce((s, o) => s + o.value, 0);
      return {
        user: u,
        deals: won.length,
        wonValue,
        pipelineValue: open.reduce((s, o) => s + o.value, 0),
        goal: u.goal,
        attainment: u.goal > 0 ? (wonValue / u.goal) * 100 : 0,
      };
    })
    .sort((a, b) => b.wonValue - a.wonValue);
}

// ---------- Distribución por fuente de captación ----------
export function getSourceBreakdown(data: CrmData) {
  const counts = new Map<LeadSource, { count: number; value: number }>();
  data.prospects.forEach((p) => {
    const cur = counts.get(p.source) ?? { count: 0, value: 0 };
    cur.count += 1;
    cur.value += p.estimatedValue;
    counts.set(p.source, cur);
  });
  return Array.from(counts.entries())
    .map(([source, v]) => ({
      source,
      label: LEAD_SOURCE_LABEL[source],
      count: v.count,
      value: v.value,
    }))
    .sort((a, b) => b.count - a.count);
}

// ---------- Embudo de conversión de prospectos ----------
export function getConversionReport(data: CrmData) {
  const total = data.prospects.length;
  const byStatus = {
    nuevo: data.prospects.filter((p) => p.status === "nuevo").length,
    contactado: data.prospects.filter((p) => p.status === "contactado").length,
    calificado: data.prospects.filter((p) => p.status === "calificado").length,
    convertido: data.prospects.filter((p) => p.status === "convertido").length,
    perdido: data.prospects.filter((p) => p.status === "perdido").length,
  };
  return { total, byStatus };
}

// ---------- Tendencia de actividades por tipo ----------
export function getActivityBreakdown(data: CrmData) {
  const types = ["llamada", "reunion", "correo", "tarea"] as const;
  return types.map((t) => ({
    type: t,
    total: data.activities.filter((a) => a.type === t).length,
    completadas: data.activities.filter((a) => a.type === t && a.completed)
      .length,
  }));
}
