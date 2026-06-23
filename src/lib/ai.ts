// ============================================================
// FlowCRM — Motor de "IA Comercial"
// Genera resúmenes y recomendaciones a partir de los datos del CRM
// mediante un sistema de reglas heurísticas (sin dependencias externas).
// La firma está pensada para sustituirse por una llamada a un LLM
// (ej. Claude / Anthropic) conservando el mismo contrato.
// ============================================================
import {
  ACTIVITY_TYPE_LABEL,
  LEAD_SOURCE_LABEL,
  PIPELINE_STAGE_LABEL,
  type Activity,
  type Client,
  type CrmData,
  type Opportunity,
  type Prospect,
} from "./types";
import { formatCurrency } from "./utils";
import { fromNow, isOverdue } from "./format";

export interface AiInsight {
  summary: string;
  nextAction: string;
  priority: "alta" | "media" | "baja";
  signals: string[];
}

const DAY = 1000 * 60 * 60 * 24;
function daysSince(iso: string | null | undefined, ref: Date) {
  if (!iso) return Infinity;
  return Math.floor((ref.getTime() - new Date(iso).getTime()) / DAY);
}

// ---------- Insight para un prospecto ----------
export function prospectInsight(
  p: Prospect,
  activities: Activity[],
  ref = new Date("2026-06-22"),
): AiInsight {
  const signals: string[] = [];
  let priority: AiInsight["priority"] = "media";

  if (p.score >= 75) {
    signals.push(`Score alto (${p.score}/100): lead muy calificado.`);
    priority = "alta";
  } else if (p.score < 40) {
    signals.push(`Score bajo (${p.score}/100): requiere nutrición.`);
    priority = "baja";
  }

  const sinceContact = daysSince(p.lastContactAt, ref);
  if (p.lastContactAt === null) {
    signals.push("Aún no ha sido contactado.");
  } else if (sinceContact > 14) {
    signals.push(`Sin contacto desde hace ${sinceContact} días: riesgo de enfriamiento.`);
    if (priority !== "alta") priority = "alta";
  }

  if (p.estimatedValue >= 300000) {
    signals.push(`Oportunidad de alto valor (${formatCurrency(p.estimatedValue)}).`);
    priority = "alta";
  }

  signals.push(`Origen: ${LEAD_SOURCE_LABEL[p.source]}.`);

  const pending = activities.filter(
    (a) => a.relatedId === p.id && !a.completed,
  );

  const summary =
    `${p.name} (${p.position || "contacto"}) de ${p.company} es un prospecto en estado ` +
    `"${p.status}" con un score de ${p.score}/100 y un valor estimado de ` +
    `${formatCurrency(p.estimatedValue)}. ${
      p.lastContactAt
        ? `Último contacto ${fromNow(p.lastContactAt)}.`
        : "Todavía no se le ha dado seguimiento."
    }`;

  let nextAction: string;
  if (p.status === "nuevo") {
    nextAction = `Realizar primer contacto con ${p.name} para calificar la necesidad y agendar una demo.`;
  } else if (p.status === "contactado") {
    nextAction = `Enviar información de valor y proponer una reunión de descubrimiento esta semana.`;
  } else if (p.status === "calificado") {
    nextAction = `Preparar y enviar una cotización formal; crear la oportunidad en el pipeline.`;
  } else if (pending.length > 0) {
    nextAction = `Completar la actividad pendiente: "${pending[0].subject}".`;
  } else {
    nextAction = `Dar seguimiento para reactivar el interés de ${p.company}.`;
  }

  return { summary, nextAction, priority, signals };
}

// ---------- Insight para un cliente ----------
export function clientInsight(
  c: Client,
  opportunities: Opportunity[],
  activities: Activity[],
  ref = new Date("2026-06-22"),
): AiInsight {
  const signals: string[] = [];
  let priority: AiInsight["priority"] = "media";

  const opps = opportunities.filter((o) => o.clientId === c.id);
  const open = opps.filter((o) => o.stage !== "ganada" && o.stage !== "perdida");
  const won = opps.filter((o) => o.stage === "ganada");
  const acts = activities.filter((a) => a.relatedId === c.id);
  const lastAct = acts
    .map((a) => a.dueDate)
    .sort()
    .at(-1);
  const sinceAct = daysSince(lastAct ?? null, ref);

  if (c.status === "en_riesgo") {
    signals.push("Cuenta marcada EN RIESGO: priorizar retención.");
    priority = "alta";
  }
  if (c.status === "inactivo") {
    signals.push("Cuenta inactiva: oportunidad de reactivación.");
  }
  if (open.length > 0) {
    signals.push(`${open.length} oportunidad(es) abiertas por ${formatCurrency(open.reduce((s, o) => s + o.value, 0))}.`);
    priority = open.some((o) => o.stage === "negociacion") ? "alta" : priority;
  }
  if (sinceAct > 30) {
    signals.push(`Sin actividad registrada en ${isFinite(sinceAct) ? sinceAct : "—"} días.`);
  }
  signals.push(`Valor histórico: ${formatCurrency(c.totalValue)} · Industria: ${c.industry}.`);

  const summary =
    `${c.company} es un cliente ${c.status === "activo" ? "activo" : c.status} del sector ` +
    `${c.industry} con un valor histórico de ${formatCurrency(c.totalValue)}. ` +
    `Tiene ${open.length} oportunidad(es) abiertas y ${won.length} cerrada(s) ganada(s). ` +
    `${lastAct ? `Última interacción ${fromNow(lastAct)}.` : "Sin interacciones recientes."}`;

  let nextAction: string;
  if (c.status === "en_riesgo") {
    nextAction = `Agendar una llamada de retención con ${c.name || c.company} para entender su nivel de satisfacción.`;
  } else if (open.some((o) => o.stage === "negociacion")) {
    const deal = open.find((o) => o.stage === "negociacion")!;
    nextAction = `Cerrar la negociación "${deal.title}" (${formatCurrency(deal.value)}): enviar propuesta final.`;
  } else if (open.length > 0) {
    nextAction = `Dar seguimiento a la oportunidad "${open[0].title}" y avanzarla de etapa.`;
  } else {
    nextAction = `Identificar oportunidades de venta cruzada / upsell con ${c.company}.`;
  }

  return { summary, nextAction, priority, signals };
}

// ---------- Resumen global del negocio ----------
export function businessBriefing(data: CrmData, ref = new Date("2026-06-22")) {
  const open = data.opportunities.filter(
    (o) => o.stage !== "ganada" && o.stage !== "perdida",
  );
  const negociacion = open.filter((o) => o.stage === "negociacion");
  const closingSoon = open
    .filter((o) => {
      const d = daysSince(o.expectedCloseDate, ref);
      return d > -14 && d < 0; // cierra en los próximos 14 días
    })
    .sort((a, b) => b.value - a.value);
  const overdueActs = data.activities.filter(
    (a) => !a.completed && isOverdue(a.dueDate),
  );
  const hotProspects = data.prospects
    .filter((p) => p.status !== "convertido" && p.status !== "perdido" && p.score >= 75)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const recommendations: { title: string; detail: string; priority: AiInsight["priority"] }[] =
    [];

  if (negociacion.length) {
    recommendations.push({
      title: `Cierra ${negociacion.length} negociación(es) activa(s)`,
      detail: `Hay ${formatCurrency(negociacion.reduce((s, o) => s + o.value, 0))} en etapa de negociación. Prioriza ${negociacion[0].title}.`,
      priority: "alta",
    });
  }
  if (closingSoon.length) {
    recommendations.push({
      title: `${closingSoon.length} oportunidad(es) cierran pronto`,
      detail: `Da seguimiento inmediato a "${closingSoon[0].title}" (${formatCurrency(closingSoon[0].value)}).`,
      priority: "alta",
    });
  }
  if (overdueActs.length) {
    recommendations.push({
      title: `${overdueActs.length} actividad(es) vencidas`,
      detail: `Reagenda o completa las tareas atrasadas para no perder momentum.`,
      priority: "media",
    });
  }
  if (hotProspects.length) {
    recommendations.push({
      title: `${hotProspects.length} prospecto(s) calientes sin convertir`,
      detail: `Contacta a ${hotProspects[0].company} (score ${hotProspects[0].score}) antes de que se enfríe.`,
      priority: "media",
    });
  }

  const summary =
    `Tienes ${open.length} oportunidades abiertas por ` +
    `${formatCurrency(open.reduce((s, o) => s + o.value, 0))}, de las cuales ` +
    `${negociacion.length} están en negociación. ` +
    `${overdueActs.length} actividades están vencidas y ` +
    `${hotProspects.length} prospectos calientes esperan seguimiento. ` +
    `El foco de esta semana debe estar en acelerar los cierres de mayor valor.`;

  return { summary, recommendations, hotProspects };
}

export const STAGE_LABEL = PIPELINE_STAGE_LABEL;
export const ACTIVITY_LABEL = ACTIVITY_TYPE_LABEL;
