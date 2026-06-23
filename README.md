# FlowCRM — CRM SaaS para PYMES

Plataforma de CRM moderna, profesional y **100% responsive** para pequeñas y
medianas empresas. Construida como proyecto de portafolio con un stack de
producción y datos de ejemplo realistas.

> **Funciona sin configurar nada.** Arranca en modo demo con datos mock
> persistidos en el navegador (localStorage). Opcionalmente se conecta a
> Supabase para persistencia real.

![Stack](https://img.shields.io/badge/Next.js-15-black) ![TS](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8) ![Supabase](https://img.shields.io/badge/Supabase-ready-3ecf8e)

---

## ✨ Características

| Módulo | Descripción |
| --- | --- |
| **Dashboard Ejecutivo** | KPIs, funnel de ventas, ventas por mes y ranking de ejecutivos |
| **Prospectos** | CRUD completo, filtros, búsqueda, score y conversión a cliente |
| **Pipeline Kanban** | Tablero drag & drop de oportunidades por etapa |
| **Clientes** | Ficha 360°, historial y timeline de actividades |
| **Actividades** | Llamadas, reuniones, correos y tareas con agenda |
| **Cotizaciones** | CRUD con conceptos dinámicos y **exportación a PDF** |
| **Reportes** | Conversión, ventas, fuentes de captación y desempeño |
| **IA Comercial** | Resumen automático y recomendación de siguiente acción |
| **Equipo** | Alta/edición/baja de ejecutivos asignables (con reasignación de registros) |

Extras: modo claro/oscuro, diseño responsive, toasts, datos persistentes.

---

## 🧱 Stack tecnológico

- **Next.js 15** (App Router, React 19, Server/Client Components)
- **TypeScript** estricto
- **Tailwind CSS** + componentes estilo **shadcn/ui** (Radix UI)
- **Supabase** / **PostgreSQL** (esquema incluido) — opcional
- **Recharts** (gráficos)
- **TanStack Table** (tablas con orden, filtro y paginación)
- **@hello-pangea/dnd** (drag & drop del Kanban)
- **jsPDF + autoTable** (PDF de cotizaciones)
- **date-fns** (fechas en español)

---

## 🚀 Puesta en marcha

```bash
# 1. Instalar dependencias
npm install        # o pnpm install

# 2. Entorno de desarrollo
npm run dev

# 3. Abrir
# http://localhost:3000
```

La app abre en la landing; entra a la demo desde **"Entrar a la demo"** o
visita `/dashboard` directamente.

### Compilar para producción

```bash
npm run build
npm run start
```

---

## 🗂️ Estructura del proyecto

```
src/
├── app/
│   ├── (app)/                # Shell con sidebar + topbar (rutas protegidas)
│   │   ├── dashboard/
│   │   ├── prospectos/
│   │   ├── pipeline/
│   │   ├── clientes/[id]/
│   │   ├── actividades/
│   │   ├── cotizaciones/
│   │   ├── reportes/
│   │   └── ia/
│   ├── layout.tsx            # Providers globales (tema, store, toaster)
│   └── page.tsx              # Landing pública
├── components/
│   ├── ui/                   # Primitivas estilo shadcn (Radix)
│   ├── layout/               # Sidebar, Topbar
│   ├── shared/               # PageHeader, DataTable, badges, timeline...
│   ├── dashboard/ pipeline/ prospects/ clients/ activities/ quotes/
├── hooks/                    # use-toast
└── lib/
    ├── types.ts              # Modelo de dominio + etiquetas
    ├── mock-data.ts          # Datos semilla deterministas
    ├── store.tsx             # Estado global (contexto + localStorage)
    ├── analytics.ts          # KPIs, funnel, ranking, fuentes...
    ├── ai.ts                 # Motor de IA comercial (reglas)
    ├── pdf.ts                # Exportación de cotizaciones a PDF
    ├── format.ts             # Fechas (date-fns, locale es)
    ├── nav.ts                # Configuración de navegación
    └── supabase/client.ts    # Cliente Supabase (opcional)
supabase/
└── schema.sql                # Esquema PostgreSQL (tablas, enums, RLS, triggers)
```

---

## 🔌 Conectar Supabase (opcional)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ejecuta `supabase/schema.sql` en el **SQL Editor**.
3. Copia `.env.example` a `.env.local` y completa:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_DATA_SOURCE=supabase
   ```

El cliente queda disponible en `src/lib/supabase/client.ts`. La capa de datos
(`store.tsx`) está diseñada con un API CRUD que se puede mapear 1:1 a Supabase
sin cambiar la UI.

---

## 🏛️ Notas de arquitectura

- **Capa de datos desacoplada:** la UI consume un store con un contrato CRUD
  estable; cambiar de mock a Supabase no afecta a los componentes.
- **Datos deterministas:** la semilla se genera con un RNG con semilla fija y
  fechas relativas a una referencia, evitando errores de hidratación en SSR.
- **IA con contrato estable:** `lib/ai.ts` devuelve `{ summary, nextAction,
  priority, signals }`; basta reemplazar la heurística por una llamada a un LLM.
- **Accesibilidad:** componentes Radix, foco visible, labels y roles ARIA.

---

## 👥 Equipo (roles simulados del proyecto)

Desarrollado bajo la perspectiva de un equipo senior: **Product Manager**,
**Business Analyst**, **UX Designer** y **Full Stack Developer**.

## 📄 Licencia

Proyecto de portafolio con fines educativos y demostrativos.
