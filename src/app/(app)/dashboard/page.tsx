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
import {
  PeriodSelector,
  type PeriodState,
} from "@/components/dashboard/period-selector";
import { useStore } from "@/lib/store";
import {
  APP_TODAY,
  filterCrmByRange,
  getExecutiveRanking,
  getFunnel,
  getKpis,
  getPeriodRange,
  getSalesTrend,
  getSourceBreakdown,
  PERIOD_LABEL,
} from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { StageBadge } from "@/components/shared/badges";

// Fecha de referencia en formato yyyy-mm-dd para los inputs "custom".
const TODAY_ISO = APP_TODAY.toISOString().slice(0, 10);
const MONTH_AGO_ISO = new Date(
  APP_TODAY.getFullYear(),
  APP_TODAY.getMonth() - 1,
  APP_TODAY.getDate(),
)
  .toISOString()
  .slice(0, 10);

export default function DashboardPage() {
  const data = useStore();
  const [period, setPeriod] = React.useState<PeriodState>({
    preset: "6m",
    from: MONTH_AGO_ISO,
    to: TODAY_ISO,
  });

  const range = React.useMemo(
    () => getPeriodRange(period.preset, period.from, period.to),
    [period],
  );

  // Dataset acotado al periodo seleccionado.
  const view = React.useMemo(
    () => filterCrmByRange(data, range),
    [data, range],
  );

  const kpis = React.useMemo(() => getKpis(view), [view]);
  const funnel = React.useMemo(() => getFunnel(view), [view]);
  // La serie usa el dataset completo pero acotado por el rango interno.
  const monthly = React.useMemo(() => getSalesTrend(data, range), [data, range]);
  const sources = React.useMemo(() => getSourceBreakdown(view), [view]);
  const ranking = React.useMemo(() => getExecutiveRanking(view), [view]);

  const recentDeals = React.useMemo(
    () =>
      [...view.opportunities]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    [view.opportunities],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Ejecutivo"
        description="Resumen del desempeño comercial en tiempo real"
      >
        <PeriodSelector value={period} onChange={setPeriod} />
      </PageHeader>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="info">
          {formatDate(range.from.toISOString())} —{" "}
          {formatDate(range.to.toISOString())}
        </Badge>
        <span>· {view.opportunities.length} oportunidades en el periodo</span>
      </div>

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
          <SalesChart
            data={monthly}
            description={`Ventas ganadas vs. meta · ${PERIOD_LABEL[period.preset]}`}
          />
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
