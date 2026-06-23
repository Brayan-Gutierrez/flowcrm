// ============================================================
// FlowCRM — Generador de notificaciones a partir de los datos
// Deriva alertas accionables: actividades vencidas, oportunidades
// que cierran pronto / en negociación y prospectos calientes.
// Determinista (usa APP_TODAY) para no romper la hidratación SSR.
// ============================================================
import { APP_TODAY } from "./analytics";
import { formatCurrency } from "./utils";
import type { CrmData } from "./types";

const DAY = 1000 * 60 * 60 * 24;

export type NotificationKind =
  | "actividad_vencida"
  | "cierre_proximo"
  | "negociacion"
  | "prospecto_caliente";

export interface CrmNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  href: string;
  priority: "alta" | "media";
}

export function getNotifications(data: CrmData): CrmNotification[] {
  const now = APP_TODAY.getTime();
  const items: CrmNotification[] = [];

  // ── Actividades vencidas (sin completar) ──
  data.activities
    .filter((a) => !a.completed && new Date(a.dueDate).getTime() < now)
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )
    .slice(0, 5)
    .forEach((a) => {
      const days = Math.max(
        1,
        Math.round((now - new Date(a.dueDate).getTime()) / DAY),
      );
      items.push({
        id: `act_${a.id}`,
        kind: "actividad_vencida",
        title: a.subject,
        description: `${a.relatedName} · vencida hace ${days} día${days === 1 ? "" : "s"}`,
        href: "/actividades",
        priority: "alta",
      });
    });

  // ── Oportunidades abiertas ──
  const open = data.opportunities.filter(
    (o) => o.stage !== "ganada" && o.stage !== "perdida",
  );
  const seen = new Set<string>();

  // Cierran pronto (próximos 14 días)
  open
    .filter((o) => {
      const d = (new Date(o.expectedCloseDate).getTime() - now) / DAY;
      return d >= 0 && d <= 14;
    })
    .sort(
      (a, b) =>
        new Date(a.expectedCloseDate).getTime() -
        new Date(b.expectedCloseDate).getTime(),
    )
    .slice(0, 5)
    .forEach((o) => {
      seen.add(o.id);
      const days = Math.max(
        0,
        Math.round((new Date(o.expectedCloseDate).getTime() - now) / DAY),
      );
      items.push({
        id: `close_${o.id}`,
        kind: "cierre_proximo",
        title: o.title,
        description: `Cierra ${days === 0 ? "hoy" : `en ${days} día${days === 1 ? "" : "s"}`} · ${formatCurrency(o.value)}`,
        href: "/pipeline",
        priority: "alta",
      });
    });

  // En negociación (que no estén ya listadas por cierre próximo)
  open
    .filter((o) => o.stage === "negociacion" && !seen.has(o.id))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4)
    .forEach((o) => {
      items.push({
        id: `nego_${o.id}`,
        kind: "negociacion",
        title: o.title,
        description: `En negociación · ${formatCurrency(o.value)}`,
        href: "/pipeline",
        priority: "media",
      });
    });

  // ── Prospectos calientes sin convertir ──
  data.prospects
    .filter(
      (p) =>
        p.status !== "convertido" &&
        p.status !== "perdido" &&
        p.score >= 75,
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .forEach((p) => {
      items.push({
        id: `lead_${p.id}`,
        kind: "prospecto_caliente",
        title: p.company,
        description: `Prospecto caliente · score ${p.score}`,
        href: "/prospectos",
        priority: "media",
      });
    });

  // Prioridad alta primero
  return items.sort((a, b) =>
    a.priority === b.priority ? 0 : a.priority === "alta" ? -1 : 1,
  );
}
