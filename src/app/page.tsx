import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarCheck,
  FileText,
  KanbanSquare,
  Sparkles,
  UserPlus,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  { icon: BarChart3, title: "Dashboard Ejecutivo", desc: "KPIs, funnel de ventas y ranking de ejecutivos en tiempo real." },
  { icon: UserPlus, title: "Prospectos", desc: "CRUD completo, filtros, búsqueda y conversión a cliente." },
  { icon: KanbanSquare, title: "Pipeline Kanban", desc: "Arrastra oportunidades entre etapas con drag & drop." },
  { icon: Building2, title: "Clientes 360°", desc: "Historial, actividades y timeline por cuenta." },
  { icon: CalendarCheck, title: "Actividades", desc: "Llamadas, reuniones, correos y tareas en una agenda." },
  { icon: FileText, title: "Cotizaciones", desc: "Genera propuestas y expórtalas a PDF en un clic." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">FlowCRM</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Características</a>
            <a href="#pricing" className="hover:text-foreground">Precios</a>
          </nav>
          <Button asChild>
            <Link href="/dashboard">
              Entrar a la demo <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--primary)/0.12),transparent)]" />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center md:py-28">
          <Badge variant="info" className="mb-5">
            CRM diseñado para PYMES
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Convierte más prospectos en{" "}
            <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              clientes felices
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            FlowCRM unifica tu proceso comercial: prospectos, pipeline,
            cotizaciones, reportes e IA comercial. Todo en una plataforma
            moderna, rápida y lista para tu equipo.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Probar el dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pipeline">Ver el pipeline</Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {["Sin tarjeta de crédito", "Datos de ejemplo incluidos", "100% responsive"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-success" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Todo tu proceso comercial en un solo lugar
            </h2>
            <p className="mt-3 text-muted-foreground">
              Ocho módulos integrados para que tu equipo venda más y mejor.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-primary to-violet-600 p-10 text-center text-primary-foreground shadow-lg">
            <h2 className="text-3xl font-bold">Empieza a vender con FlowCRM</h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
              Explora la demo completa con datos realistas. Sin registro.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-7">
              <Link href="/dashboard">
                Entrar ahora <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">FlowCRM</span>
            <span>— CRM para PYMES</span>
          </div>
          <p>Proyecto de portafolio · Next.js 15 · Supabase · TypeScript</p>
        </div>
      </footer>
    </div>
  );
}
