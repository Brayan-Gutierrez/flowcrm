"use client";

// ============================================================
// FlowCRM — Store en memoria (contexto React)
// Provee CRUD reactivo sobre los datos del CRM y persiste en
// localStorage para que la demo sea totalmente interactiva sin backend.
// La forma del API está pensada para migrar a Supabase sin tocar la UI.
// ============================================================
import * as React from "react";
import { seedData } from "./mock-data";
import { can } from "./permissions";
import type {
  Activity,
  Client,
  CrmData,
  Opportunity,
  PipelineStage,
  Prospect,
  Quote,
  User,
} from "./types";

const STORAGE_KEY = "flowcrm:data:v1";
const SESSION_KEY = "flowcrm:session:v1";

function genId(prefix: string) {
  return `${prefix}_${Math.abs(
    Math.floor((Date.now() % 1e9) + Math.random() * 1e6),
  ).toString(36)}`;
}

interface StoreContextValue extends CrmData {
  /** Id usado por defecto como "dueño" de nuevos registros (siempre válido). */
  currentUserId: string;
  // Sesión (login simulado)
  sessionUserId: string | null;
  ready: boolean; // ya se resolvió la sesión desde localStorage
  login: (userId: string) => void;
  logout: () => void;
  // Equipo / Ejecutivos
  addUser: (u: Omit<User, "id">) => User;
  updateUser: (id: string, patch: Partial<User>) => void;
  /** Elimina un ejecutivo; si tiene registros, los reasigna a reassignToId. */
  deleteUser: (id: string, reassignToId?: string) => void;
  /** Nº de registros (prospectos, clientes, oportunidades...) asignados. */
  countAssignments: (id: string) => number;
  // Prospectos
  addProspect: (p: Omit<Prospect, "id" | "createdAt">) => Prospect;
  updateProspect: (id: string, patch: Partial<Prospect>) => void;
  deleteProspect: (id: string) => void;
  convertProspect: (id: string) => Client | null;
  // Clientes
  addClient: (c: Omit<Client, "id" | "createdAt">) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  // Oportunidades
  addOpportunity: (o: Omit<Opportunity, "id" | "createdAt">) => Opportunity;
  updateOpportunity: (id: string, patch: Partial<Opportunity>) => void;
  moveOpportunity: (id: string, stage: PipelineStage) => void;
  deleteOpportunity: (id: string) => void;
  // Actividades
  addActivity: (a: Omit<Activity, "id" | "createdAt">) => Activity;
  updateActivity: (id: string, patch: Partial<Activity>) => void;
  toggleActivity: (id: string) => void;
  deleteActivity: (id: string) => void;
  // Cotizaciones
  addQuote: (q: Omit<Quote, "id" | "createdAt" | "number">) => Quote;
  updateQuote: (id: string, patch: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  // Utilidades
  resetData: () => void;
}

const StoreContext = React.createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<CrmData>(seedData);
  const [hydrated, setHydrated] = React.useState(false);
  const [sessionUserId, setSessionUserId] = React.useState<string | null>(null);

  // Carga datos y sesión desde localStorage al montar (solo cliente).
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    try {
      const sess = window.localStorage.getItem(SESSION_KEY);
      if (sess) setSessionUserId(sess);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Persiste en cada cambio.
  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [data, hydrated]);

  const value = React.useMemo<StoreContextValue>(() => {
    const update = (patch: Partial<CrmData>) =>
      setData((d) => ({ ...d, ...patch }));

    return {
      ...data,
      // Dueño por defecto: el usuario en sesión, o el primero como respaldo.
      currentUserId: sessionUserId ?? data.users[0]?.id ?? "",
      sessionUserId,
      ready: hydrated,
      login: (userId) => {
        setSessionUserId(userId);
        try {
          window.localStorage.setItem(SESSION_KEY, userId);
        } catch {
          /* ignore */
        }
      },
      logout: () => {
        setSessionUserId(null);
        try {
          window.localStorage.removeItem(SESSION_KEY);
        } catch {
          /* ignore */
        }
      },

      // ---------- Equipo / Ejecutivos ----------
      addUser: (u) => {
        const user: User = { ...u, id: genId("u") };
        setData((d) => ({ ...d, users: [...d.users, user] }));
        return user;
      },
      updateUser: (id, patch) =>
        setData((d) => ({
          ...d,
          users: d.users.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      countAssignments: (id) =>
        data.prospects.filter((x) => x.ownerId === id).length +
        data.clients.filter((x) => x.ownerId === id).length +
        data.opportunities.filter((x) => x.ownerId === id).length +
        data.activities.filter((x) => x.ownerId === id).length +
        data.quotes.filter((x) => x.ownerId === id).length,
      deleteUser: (id, reassignToId) =>
        setData((d) => {
          const reassign = (ownerId: string) =>
            ownerId === id && reassignToId ? reassignToId : ownerId;
          return {
            ...d,
            users: d.users.filter((u) => u.id !== id),
            prospects: d.prospects.map((x) => ({
              ...x,
              ownerId: reassign(x.ownerId),
            })),
            clients: d.clients.map((x) => ({
              ...x,
              ownerId: reassign(x.ownerId),
            })),
            opportunities: d.opportunities.map((x) => ({
              ...x,
              ownerId: reassign(x.ownerId),
            })),
            activities: d.activities.map((x) => ({
              ...x,
              ownerId: reassign(x.ownerId),
            })),
            quotes: d.quotes.map((x) => ({
              ...x,
              ownerId: reassign(x.ownerId),
            })),
          };
        }),

      // ---------- Prospectos ----------
      addProspect: (p) => {
        const prospect: Prospect = {
          ...p,
          id: genId("p"),
          createdAt: new Date().toISOString(),
        };
        setData((d) => ({ ...d, prospects: [prospect, ...d.prospects] }));
        return prospect;
      },
      updateProspect: (id, patch) =>
        setData((d) => ({
          ...d,
          prospects: d.prospects.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),
      deleteProspect: (id) =>
        setData((d) => ({
          ...d,
          prospects: d.prospects.filter((x) => x.id !== id),
        })),
      convertProspect: (id) => {
        const p = data.prospects.find((x) => x.id === id);
        if (!p) return null;
        const client: Client = {
          id: genId("c"),
          name: p.name,
          company: p.company,
          email: p.email,
          phone: p.phone,
          industry: "Servicios",
          status: "activo",
          totalValue: p.estimatedValue,
          ownerId: p.ownerId,
          createdAt: new Date().toISOString(),
          convertedFromProspectId: p.id,
        };
        setData((d) => ({
          ...d,
          clients: [client, ...d.clients],
          prospects: d.prospects.map((x) =>
            x.id === id ? { ...x, status: "convertido" } : x,
          ),
        }));
        return client;
      },

      // ---------- Clientes ----------
      addClient: (c) => {
        const client: Client = {
          ...c,
          id: genId("c"),
          createdAt: new Date().toISOString(),
        };
        setData((d) => ({ ...d, clients: [client, ...d.clients] }));
        return client;
      },
      updateClient: (id, patch) =>
        setData((d) => ({
          ...d,
          clients: d.clients.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      deleteClient: (id) =>
        setData((d) => ({
          ...d,
          clients: d.clients.filter((x) => x.id !== id),
        })),

      // ---------- Oportunidades ----------
      addOpportunity: (o) => {
        const opp: Opportunity = {
          ...o,
          id: genId("o"),
          createdAt: new Date().toISOString(),
        };
        setData((d) => ({
          ...d,
          opportunities: [opp, ...d.opportunities],
        }));
        return opp;
      },
      updateOpportunity: (id, patch) =>
        setData((d) => ({
          ...d,
          opportunities: d.opportunities.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),
      moveOpportunity: (id, stage) =>
        setData((d) => ({
          ...d,
          opportunities: d.opportunities.map((x) =>
            x.id === id
              ? {
                  ...x,
                  stage,
                  probability:
                    stage === "ganada"
                      ? 100
                      : stage === "perdida"
                        ? 0
                        : x.probability,
                }
              : x,
          ),
        })),
      deleteOpportunity: (id) =>
        setData((d) => ({
          ...d,
          opportunities: d.opportunities.filter((x) => x.id !== id),
        })),

      // ---------- Actividades ----------
      addActivity: (a) => {
        const activity: Activity = {
          ...a,
          id: genId("a"),
          createdAt: new Date().toISOString(),
        };
        setData((d) => ({ ...d, activities: [activity, ...d.activities] }));
        return activity;
      },
      updateActivity: (id, patch) =>
        setData((d) => ({
          ...d,
          activities: d.activities.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),
      toggleActivity: (id) =>
        setData((d) => ({
          ...d,
          activities: d.activities.map((x) =>
            x.id === id ? { ...x, completed: !x.completed } : x,
          ),
        })),
      deleteActivity: (id) =>
        setData((d) => ({
          ...d,
          activities: d.activities.filter((x) => x.id !== id),
        })),

      // ---------- Cotizaciones ----------
      addQuote: (q) => {
        const seq = data.quotes.length + 1;
        const quote: Quote = {
          ...q,
          id: genId("q"),
          number: `COT-2026-${String(seq).padStart(4, "0")}`,
          createdAt: new Date().toISOString(),
        };
        setData((d) => ({ ...d, quotes: [quote, ...d.quotes] }));
        return quote;
      },
      updateQuote: (id, patch) =>
        setData((d) => ({
          ...d,
          quotes: d.quotes.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      deleteQuote: (id) =>
        setData((d) => ({
          ...d,
          quotes: d.quotes.filter((x) => x.id !== id),
        })),

      resetData: () => {
        setData(seedData);
        update({});
      },
    };
  }, [data, sessionUserId, hydrated]);

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de <StoreProvider>");
  return ctx;
}

export function useCurrentUser() {
  const { users, currentUserId } = useStore();
  return users.find((u) => u.id === currentUserId) ?? users[0];
}

/** Usuario realmente autenticado (o undefined si no hay sesión). */
export function useSessionUser() {
  const { users, sessionUserId } = useStore();
  return users.find((u) => u.id === sessionUserId);
}

/** Permisos derivados del rol del usuario en sesión. */
export function usePermissions() {
  const user = useSessionUser();
  return {
    role: user?.role,
    canManageTeam: can(user?.role, "manage_team"),
    canDelete: can(user?.role, "delete_record"),
    canReassign: can(user?.role, "reassign_owner"),
  };
}

export function useUserMap() {
  const { users } = useStore();
  return React.useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users],
  );
}
