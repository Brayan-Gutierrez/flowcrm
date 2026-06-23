// ============================================================
// FlowCRM — Modelo de dominio
// ============================================================

export type Role = "admin" | "gerente" | "ejecutivo";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  goal: number; // meta mensual de ventas
}

// ---------- Prospectos ----------
export type LeadSource =
  | "web"
  | "referido"
  | "redes_sociales"
  | "evento"
  | "llamada_fria"
  | "email_marketing";

export type ProspectStatus =
  | "nuevo"
  | "contactado"
  | "calificado"
  | "perdido"
  | "convertido";

export interface Prospect {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  position: string;
  source: LeadSource;
  status: ProspectStatus;
  estimatedValue: number;
  score: number; // 0-100
  ownerId: string;
  notes: string;
  createdAt: string; // ISO
  lastContactAt: string | null;
}

// ---------- Clientes ----------
export type ClientStatus = "activo" | "inactivo" | "en_riesgo";

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  industry: string;
  status: ClientStatus;
  totalValue: number; // valor total facturado
  ownerId: string;
  createdAt: string;
  convertedFromProspectId?: string;
  address?: string;
}

// ---------- Oportunidades (Pipeline) ----------
export type PipelineStage =
  | "prospeccion"
  | "calificacion"
  | "propuesta"
  | "negociacion"
  | "ganada"
  | "perdida";

export interface Opportunity {
  id: string;
  title: string;
  clientId?: string;
  prospectId?: string;
  accountName: string; // nombre mostrado de la cuenta
  value: number;
  stage: PipelineStage;
  probability: number; // 0-100
  ownerId: string;
  expectedCloseDate: string;
  createdAt: string;
  source: LeadSource;
}

// ---------- Actividades ----------
export type ActivityType = "llamada" | "reunion" | "correo" | "tarea";

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  description: string;
  relatedType: "prospect" | "client" | "opportunity";
  relatedId: string;
  relatedName: string;
  ownerId: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

// ---------- Cotizaciones ----------
export type QuoteStatus = "borrador" | "enviada" | "aceptada" | "rechazada";

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  number: string;
  clientId?: string;
  accountName: string;
  status: QuoteStatus;
  items: QuoteItem[];
  taxRate: number; // ej. 16
  ownerId: string;
  createdAt: string;
  validUntil: string;
  notes: string;
}

// ============================================================
// Etiquetas y metadatos para la UI
// ============================================================

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  web: "Sitio Web",
  referido: "Referido",
  redes_sociales: "Redes Sociales",
  evento: "Evento",
  llamada_fria: "Llamada Fría",
  email_marketing: "Email Marketing",
};

export const PROSPECT_STATUS_LABEL: Record<ProspectStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  calificado: "Calificado",
  perdido: "Perdido",
  convertido: "Convertido",
};

export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  en_riesgo: "En riesgo",
};

export const PIPELINE_STAGES: { id: PipelineStage; label: string; color: string }[] = [
  { id: "prospeccion", label: "Prospección", color: "#6366f1" },
  { id: "calificacion", label: "Calificación", color: "#8b5cf6" },
  { id: "propuesta", label: "Propuesta", color: "#0ea5e9" },
  { id: "negociacion", label: "Negociación", color: "#f59e0b" },
  { id: "ganada", label: "Ganada", color: "#22c55e" },
  { id: "perdida", label: "Perdida", color: "#ef4444" },
];

export const PIPELINE_STAGE_LABEL: Record<PipelineStage, string> =
  PIPELINE_STAGES.reduce(
    (acc, s) => ({ ...acc, [s.id]: s.label }),
    {} as Record<PipelineStage, string>,
  );

export const ACTIVITY_TYPE_LABEL: Record<ActivityType, string> = {
  llamada: "Llamada",
  reunion: "Reunión",
  correo: "Correo",
  tarea: "Tarea",
};

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
};

// Estado completo de la aplicación (en memoria / Supabase)
export interface CrmData {
  users: User[];
  prospects: Prospect[];
  clients: Client[];
  opportunities: Opportunity[];
  activities: Activity[];
  quotes: Quote[];
}
