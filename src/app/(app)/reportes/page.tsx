"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, TrendingUp, Target, DollarSign, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  getActivityBreakdown,
  getConversionReport,
  getExecutiveRanking,
  getKpis,
  getMonthlySales,
  getSourceBreakdown,
} from "@/lib/analytics";
import { ACTIVITY_TYPE_LABEL } from "@/lib/types";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/utils";

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#0ea5e9", "#f59e0b", "#22c55e", "#ec4899"];
const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--popover))",
  fontSize: 12,
};

export default function ReportesPage() {
  const data = useStore();
  const { toast } = useToast();

  const kpis = React.useMemo(() => getKpis(data), [data]);
  const monthly = React.useMemo(() => getMonthlySales(data), [data]);
  const sources = React.useMemo(() => getSourceBreakdown(data), [data]);
  const conversion = React.useMemo(() => getConversionReport(data), [data]);
  const ranking = React.useMemo(() => getExecutiveRanking(data), [data]);
  const activityBreak = React.useMemo(() => getActivityBreakdown(data), [data]);

  const conversionSteps = [
    { label: "Total leads", value: conversion.total },
    { label: "Contactados", value: conversion.total - conversion.byStatus.nuevo },
    {
      label: "Calificados",
      value: conversion.byStatus.calificado + conversion.byStatus.convertido,
    },
    { label: "Convertidos", value: conversion.byStatus.convertido },
  ];

  function handleExport() {
    toast({
      variant: "success",
      title: "Reporte exportado",
      description: "El resumen se descargaría como CSV/PDF en producción.",
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Analítica de conversión, ventas y fuentes de captación"
      >
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4" /> Exportar
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ingresos ganados" value={formatCurrency(kpis.wonValue)} icon={DollarSign} accent="success" />
        <StatCard title="Tasa de conversión" value={formatPercent(kpis.conversionRate)} icon={TrendingUp} accent="primary" />
        <StatCard title="Tasa de cierre" value={`${kpis.winRate.toFixed(0)}%`} icon={Target} accent="warning" />
        <StatCard title="Clientes" value={String(kpis.totalClients)} icon={Users} accent="violet" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ventas por mes (barras) */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas por mes</CardTitle>
            <CardDescription>Ingresos cerrados en los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ left: -10, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickFormatter={(v) => formatCompact(v as number)} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} width={48} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
                  <Bar dataKey="ganadas" name="Ganadas" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Embudo de conversión */}
        <Card>
          <CardHeader>
            <CardTitle>Embudo de conversión</CardTitle>
            <CardDescription>Del lead al cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {conversionSteps.map((step, i) => {
              const pct =
                conversionSteps[0].value > 0
                  ? (step.value / conversionSteps[0].value) * 100
                  : 0;
              return (
                <div key={step.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{step.label}</span>
                    <span className="text-muted-foreground">
                      {step.value} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    indicatorClassName={
                      ["bg-primary", "bg-violet-500", "bg-sky-500", "bg-success"][i]
                    }
                  />
                </div>
              );
            })}
            <p className="pt-2 text-xs text-muted-foreground">
              Tasa global de conversión:{" "}
              <span className="font-semibold text-foreground">
                {formatPercent(kpis.conversionRate)}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Fuentes de captación */}
        <Card>
          <CardHeader>
            <CardTitle>Fuentes de captación</CardTitle>
            <CardDescription>Prospectos y valor estimado por origen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="h-[220px] w-full sm:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sources} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={80} label={(e) => `${e.count}`} labelLine={false}>
                      {sources.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="w-full flex-1 space-y-2 text-sm">
                {sources.map((s, i) => (
                  <li key={s.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      {s.label}
                    </span>
                    <span className="text-muted-foreground">
                      {s.count} · {formatCompact(s.value)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Actividades por tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Actividades por tipo</CardTitle>
            <CardDescription>Volumen y completadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activityBreak.map((a) => ({
                    ...a,
                    label: ACTIVITY_TYPE_LABEL[a.type],
                  }))}
                  margin={{ left: -10, right: 8, top: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} width={28} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="total" name="Total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="completadas" name="Completadas" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desempeño por ejecutivo */}
      <Card>
        <CardHeader>
          <CardTitle>Desempeño por ejecutivo</CardTitle>
          <CardDescription>Ventas, pipeline y cumplimiento de meta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">Ejecutivo</th>
                  <th className="pb-2 pr-3 font-medium">Negocios</th>
                  <th className="pb-2 pr-3 font-medium">Ventas</th>
                  <th className="pb-2 pr-3 font-medium">Pipeline</th>
                  <th className="pb-2 font-medium">Cumplimiento</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r) => (
                  <tr key={r.user.id} className="border-b last:border-0">
                    <td className="py-3 pr-3 font-medium">{r.user.name}</td>
                    <td className="py-3 pr-3">{r.deals}</td>
                    <td className="py-3 pr-3 font-semibold">{formatCurrency(r.wonValue)}</td>
                    <td className="py-3 pr-3 text-muted-foreground">{formatCurrency(r.pipelineValue)}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={Math.min(100, r.attainment)}
                          className="h-1.5 w-24"
                          indicatorClassName={r.attainment >= 100 ? "bg-success" : "bg-primary"}
                        />
                        <span className="w-10 text-xs text-muted-foreground">
                          {r.attainment.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
