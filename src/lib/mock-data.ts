// ============================================================
// FlowCRM — Datos semilla (deterministas)
// Generados a partir de una fecha de referencia fija para evitar
// discrepancias de hidratación entre servidor y cliente.
// ============================================================
import type {
  Activity,
  ActivityType,
  Client,
  CrmData,
  LeadSource,
  Opportunity,
  PipelineStage,
  Prospect,
  ProspectStatus,
  Quote,
  User,
} from "./types";

// Fecha de referencia fija ("hoy" simulado)
const REF = new Date("2026-06-22T12:00:00.000Z");

function isoDaysAgo(days: number): string {
  const d = new Date(REF);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}
function isoDaysAhead(days: number): string {
  return isoDaysAgo(-days);
}

// RNG determinista (mulberry32)
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = makeRng(20260622);
const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const between = (min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

// ---------- Usuarios / Ejecutivos ----------
export const users: User[] = [
  {
    id: "u1",
    name: "Valentina Ríos",
    email: "valentina.rios@flowcrm.io",
    role: "admin",
    avatar: "https://i.pravatar.cc/120?img=47",
    goal: 850000,
  },
  {
    id: "u2",
    name: "Mateo Herrera",
    email: "mateo.herrera@flowcrm.io",
    role: "gerente",
    avatar: "https://i.pravatar.cc/120?img=12",
    goal: 700000,
  },
  {
    id: "u3",
    name: "Camila Fuentes",
    email: "camila.fuentes@flowcrm.io",
    role: "ejecutivo",
    avatar: "https://i.pravatar.cc/120?img=32",
    goal: 600000,
  },
  {
    id: "u4",
    name: "Sebastián Navarro",
    email: "sebastian.navarro@flowcrm.io",
    role: "ejecutivo",
    avatar: "https://i.pravatar.cc/120?img=15",
    goal: 600000,
  },
  {
    id: "u5",
    name: "Daniela Ocampo",
    email: "daniela.ocampo@flowcrm.io",
    role: "ejecutivo",
    avatar: "https://i.pravatar.cc/120?img=5",
    goal: 550000,
  },
];

const ownerIds = users.map((u) => u.id);

// ---------- Catálogos ----------
const firstNames = [
  "Lucía", "Diego", "Sofía", "Andrés", "Martina", "Tomás", "Renata",
  "Joaquín", "Isabela", "Emilio", "Antonella", "Bruno", "Julieta",
  "Maximiliano", "Florencia", "Ignacio", "Catalina", "Felipe", "Paula",
  "Nicolás", "Regina", "Santiago", "Mariana", "Gabriel", "Victoria",
];
const lastNames = [
  "García", "Martínez", "López", "González", "Rodríguez", "Pérez",
  "Sánchez", "Ramírez", "Torres", "Flores", "Vargas", "Castillo",
  "Romero", "Morales", "Ortega", "Delgado", "Guerrero", "Mendoza",
];
const companies = [
  "TecnoSoluciones SA", "Distribuidora Andina", "Grupo Vértice",
  "Logística Pacífico", "Innova Retail", "Constructora Cumbre",
  "AgroValle", "Clínica Bienestar", "Estudio Creativo Nube",
  "Ferretería El Tornillo", "Importadora del Sur", "Café Montaña",
  "Textiles Aurora", "Seguros Confianza", "EduTech Latam",
  "Panadería La Espiga", "Muebles Norte", "Solar Energía Verde",
  "Transportes Rápidos", "Boutique Lumière", "Datacenter Quanta",
  "Farmacia Vida", "Hotel Costa Azul", "Automotriz Veloz",
];
const industries = [
  "Tecnología", "Retail", "Manufactura", "Salud", "Servicios",
  "Construcción", "Agroindustria", "Educación", "Logística", "Finanzas",
];
const positions = [
  "Gerente General", "Director Comercial", "Dueño", "CFO",
  "Jefe de Compras", "Coordinador de TI", "Gerente de Operaciones",
  "Socio Fundador", "Encargado de Marketing",
];
const sources: LeadSource[] = [
  "web", "referido", "redes_sociales", "evento", "llamada_fria",
  "email_marketing",
];
const prospectStatuses: ProspectStatus[] = [
  "nuevo", "contactado", "calificado", "perdido", "convertido",
];

function fullName() {
  return `${pick(firstNames)} ${pick(lastNames)}`;
}
function emailFrom(name: string, company: string) {
  const slugN = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, ".");
  const slugC = company.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(" ")[0];
  return `${slugN}@${slugC}.com`;
}
function phone() {
  return `+52 55 ${between(1000, 9999)} ${between(1000, 9999)}`;
}

// ---------- Prospectos ----------
const prospects: Prospect[] = [];
for (let i = 0; i < 38; i++) {
  const name = fullName();
  const company = pick(companies);
  const status = pick(prospectStatuses);
  const createdDays = between(1, 120);
  prospects.push({
    id: `p${i + 1}`,
    name,
    company,
    email: emailFrom(name, company),
    phone: phone(),
    position: pick(positions),
    source: pick(sources),
    status,
    estimatedValue: between(8, 120) * 5000,
    score: between(15, 98),
    ownerId: pick(ownerIds),
    notes: pick([
      "Interesado en el plan anual. Pidió comparativa de precios.",
      "Solicitó demo del módulo de reportes.",
      "Decisor presupuestal, evaluar para Q3.",
      "Llegó por recomendación de un cliente actual.",
      "Necesita integración con su ERP.",
      "Presupuesto aprobado, falta firma.",
    ]),
    createdAt: isoDaysAgo(createdDays),
    lastContactAt: status === "nuevo" ? null : isoDaysAgo(between(0, createdDays)),
  });
}

// ---------- Clientes ----------
const clients: Client[] = [];
const clientStatuses: Client["status"][] = ["activo", "activo", "activo", "inactivo", "en_riesgo"];
for (let i = 0; i < 22; i++) {
  const name = fullName();
  const company = companies[i % companies.length];
  clients.push({
    id: `c${i + 1}`,
    name,
    company,
    email: emailFrom(name, company),
    phone: phone(),
    industry: pick(industries),
    status: pick(clientStatuses),
    totalValue: between(20, 400) * 5000,
    ownerId: pick(ownerIds),
    createdAt: isoDaysAgo(between(30, 400)),
    address: `Av. ${pick(lastNames)} ${between(100, 999)}, CDMX`,
  });
}
// Marca algunos prospectos como convertidos -> vinculados a clientes
prospects.slice(0, 4).forEach((p, idx) => {
  p.status = "convertido";
  if (clients[idx]) clients[idx].convertedFromProspectId = p.id;
});

// ---------- Oportunidades ----------
const stages: PipelineStage[] = [
  "prospeccion", "calificacion", "propuesta", "negociacion", "ganada", "perdida",
];
const stageProbability: Record<PipelineStage, number> = {
  prospeccion: 15,
  calificacion: 35,
  propuesta: 55,
  negociacion: 75,
  ganada: 100,
  perdida: 0,
};
const dealTitles = [
  "Implementación CRM", "Licencias anuales", "Plan Enterprise",
  "Migración a la nube", "Consultoría comercial", "Soporte premium",
  "Ampliación de usuarios", "Integración API", "Renovación contrato",
  "Paquete de capacitación",
];
const opportunities: Opportunity[] = [];
for (let i = 0; i < 30; i++) {
  const stage = pick(stages);
  const useClient = rng() > 0.4;
  const client = useClient ? pick(clients) : undefined;
  const prospect = !useClient ? pick(prospects) : undefined;
  opportunities.push({
    id: `o${i + 1}`,
    title: `${pick(dealTitles)} — ${pick(companies).split(" ")[0]}`,
    clientId: client?.id,
    prospectId: prospect?.id,
    accountName: client?.company ?? prospect?.company ?? "Cuenta sin asignar",
    value: between(10, 160) * 5000,
    stage,
    probability: stageProbability[stage],
    ownerId: pick(ownerIds),
    expectedCloseDate:
      stage === "ganada" || stage === "perdida"
        ? isoDaysAgo(between(1, 40))
        : isoDaysAhead(between(3, 90)),
    createdAt: isoDaysAgo(between(5, 150)),
    source: pick(sources),
  });
}

// ---------- Actividades ----------
const activityTypes: ActivityType[] = ["llamada", "reunion", "correo", "tarea"];
const activitySubjects: Record<ActivityType, string[]> = {
  llamada: [
    "Llamada de seguimiento", "Llamada de calificación",
    "Llamada para agendar demo", "Cierre por teléfono",
  ],
  reunion: [
    "Reunión de descubrimiento", "Demo del producto",
    "Presentación de propuesta", "Reunión de negociación",
  ],
  correo: [
    "Envío de cotización", "Seguimiento por correo",
    "Compartir casos de éxito", "Recordatorio de renovación",
  ],
  tarea: [
    "Preparar propuesta", "Actualizar datos en el CRM",
    "Investigar la cuenta", "Enviar contrato para firma",
  ],
};
const activities: Activity[] = [];
for (let i = 0; i < 46; i++) {
  const type = pick(activityTypes);
  const useClient = rng() > 0.5;
  const ref = useClient ? pick(clients) : pick(prospects);
  const isPast = rng() > 0.45;
  activities.push({
    id: `a${i + 1}`,
    type,
    subject: pick(activitySubjects[type]),
    description: pick([
      "Confirmar disponibilidad y próximos pasos.",
      "Resolver dudas sobre el alcance del proyecto.",
      "Validar presupuesto con el área financiera.",
      "Acordar fecha de inicio de implementación.",
      "Compartir material de apoyo y referencias.",
    ]),
    relatedType: useClient ? "client" : "prospect",
    relatedId: ref.id,
    relatedName: ref.company,
    ownerId: pick(ownerIds),
    dueDate: isPast ? isoDaysAgo(between(0, 20)) : isoDaysAhead(between(0, 14)),
    completed: isPast ? rng() > 0.3 : false,
    createdAt: isoDaysAgo(between(0, 30)),
  });
}

// ---------- Cotizaciones ----------
const quoteItemsCatalog = [
  { description: "Licencia FlowCRM Pro (anual)", unitPrice: 18000 },
  { description: "Licencia FlowCRM Enterprise (anual)", unitPrice: 32000 },
  { description: "Implementación y onboarding", unitPrice: 25000 },
  { description: "Integración con ERP", unitPrice: 40000 },
  { description: "Capacitación equipo comercial", unitPrice: 12000 },
  { description: "Soporte premium 24/7 (anual)", unitPrice: 15000 },
  { description: "Usuarios adicionales (paquete 10)", unitPrice: 9000 },
  { description: "Consultoría de procesos", unitPrice: 22000 },
];
const quoteStatuses: Quote["status"][] = [
  "borrador", "enviada", "enviada", "aceptada", "rechazada",
];
const quotes: Quote[] = [];
for (let i = 0; i < 16; i++) {
  const client = pick(clients);
  const itemCount = between(1, 4);
  const items = Array.from({ length: itemCount }).map((_, j) => {
    const cat = pick(quoteItemsCatalog);
    return {
      id: `qi${i + 1}_${j + 1}`,
      description: cat.description,
      quantity: between(1, 5),
      unitPrice: cat.unitPrice,
    };
  });
  const created = between(2, 90);
  quotes.push({
    id: `q${i + 1}`,
    number: `COT-2026-${String(i + 1).padStart(4, "0")}`,
    clientId: client.id,
    accountName: client.company,
    status: pick(quoteStatuses),
    items,
    taxRate: 16,
    ownerId: pick(ownerIds),
    createdAt: isoDaysAgo(created),
    validUntil: isoDaysAhead(between(5, 30)),
    notes: "Precios en MXN. Vigencia sujeta a disponibilidad.",
  });
}

export const seedData: CrmData = {
  users,
  prospects,
  clients,
  opportunities,
  activities,
  quotes,
};
