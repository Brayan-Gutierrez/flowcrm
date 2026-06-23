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
