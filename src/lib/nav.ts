import {
  LayoutDashboard,
  UserPlus,
  KanbanSquare,
  Building2,
  CalendarCheck,
  FileText,
  BarChart3,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Visión ejecutiva del negocio",
  },
  {
    title: "Prospectos",
    href: "/prospectos",
    icon: UserPlus,
    description: "Gestión de leads y conversión",
  },
  {
    title: "Pipeline",
    href: "/pipeline",
    icon: KanbanSquare,
    description: "Tablero Kanban de oportunidades",
  },
  {
    title: "Clientes",
    href: "/clientes",
    icon: Building2,
    description: "Cuentas, historial y timeline",
  },
  {
    title: "Actividades",
    href: "/actividades",
    icon: CalendarCheck,
    description: "Llamadas, reuniones, correos y tareas",
  },
  {
    title: "Cotizaciones",
    href: "/cotizaciones",
    icon: FileText,
    description: "Propuestas comerciales y PDF",
  },
  {
    title: "Reportes",
    href: "/reportes",
    icon: BarChart3,
    description: "Conversión, ventas y fuentes",
  },
  {
    title: "IA Comercial",
    href: "/ia",
    icon: Sparkles,
    description: "Resumen y recomendaciones",
  },
  {
    title: "Equipo",
    href: "/equipo",
    icon: UsersRound,
    description: "Administración de ejecutivos",
  },
];
