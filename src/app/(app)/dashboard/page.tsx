"use client";

import * as React from "react";
import {
  DollarSign,
  Target,
  TrendingUp,
  Users,
  Percent,
  Briefcase,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { SourceChart } from "@/components/dashboard/source-chart";
import { ExecutiveRanking } from "@/components/dashboard/executive-ranking";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import {
  getExecutiveRanking,
  getFunnel,
  getKpis,
  getMonthlySales,
  getSourceBreakdown,
} from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";
import { StageBadge } from "@/components/shared/badges";

export default function DashboardPage() {
  const data = useStore();

  const kpis = React.useMemo(() => getKpis(data), [data]);
  const funnel = React.useMemo(() => getFunnel(data), [data]);
  const monthly = React.useMemo(() => getMonthlySales(data), [data]);
  const sources = React.useMemo(() => getSourceBreakdown(data), [data]);
  const ranking = React.useMemo(() => getExecutiveRanking(data), [data]);

  const recentDeals = React.useMemo(
    () =>
      [...data.opportunities]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    [data.opportunities],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Ejecutivo"
        description="Resumen del desempeño comercial en tiempo real"
      >
        <Badge variant="info">Periodo: últimos 6 meses</Badge>
      </PageHeader>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Ventas ganadas"
          value={formatCurrency(kpis.wonValue)}
          icon={DollarSign}
          trend={12.4}
          accent="success"
        />
        <StatCard
          title="Pipeline abierto"
          value={formatCurrency(kpis.pipelineValue)}
          icon={Briefcase}
          trend={8.1}
          accent="primary"
        />
        <StatCard
          title="Pipeline ponderado"
          value={formatCurrency(kpis.weightedPipeline)}
          icon={Target}
          trend={4.6}
          accent="violet"
        />
        <StatCard
          title="Tasa de cierre"
          value={`${kpis.winRate.toFixed(0)}%`}
          icon={Percent}
          trend={2.3}
          accent="warning"
        />
        <StatCard
          title="Conversión leads"
          value={`${kpis.conversionRate.toFixed(0)}%`}
          icon={TrendingUp}
          trend={-1.2}
          accent="primary"
        />
        <StatCard
          title="Ticket promedio"
          value={formatCurrency(kpis.avgDeal)}
          icon={Users}
          trend={5.9}
          accent="success"
        />
      </div>

      {/* Gráficos principales */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesChart data={monthly} />
        </div>
        <FunnelChart data={funnel} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SourceChart data={sources} />
        <div className="lg:col-span-1">
          <ExecutiveRanking data={ranking} />
        </div>

        {/* Oportunidades recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Oportunidades recientes</CardTitle>
            <CardDescription>Últimas oportunidades creadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentDeals.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{o.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {o.accountName}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-semibold">
                    {formatCurrency(o.value)}
                  </span>
                  <StageBadge stage={o.stage} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
