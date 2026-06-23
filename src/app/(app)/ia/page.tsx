"use client";

import * as React from "react";
import {
  Sparkles,
  Flame,
  ArrowRight,
  Lightbulb,
  Wand2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import {
  businessBriefing,
  clientInsight,
  prospectInsight,
  type AiInsight,
} from "@/lib/ai";
import { formatCurrency } from "@/lib/utils";

const priorityVariant = {
  alta: "destructive",
  media: "warning",
  baja: "secondary",
} as const;

export default function IAPage() {
  const data = useStore();
  const briefing = React.useMemo(() => businessBriefing(data), [data]);

  const [kind, setKind] = React.useState<"prospect" | "client">("prospect");
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [insight, setInsight] = React.useState<AiInsight | null>(null);
  const [loading, setLoading] = React.useState(false);

  const options =
    kind === "prospect"
      ? data.prospects.map((p) => ({ id: p.id, label: `${p.name} — ${p.company}` }))
      : data.clients.map((c) => ({ id: c.id, label: c.company }));

  function analyze() {
    if (!selectedId) return;
    setLoading(true);
    setInsight(null);
    // Simula la latencia de un modelo (la generación es instantánea).
    setTimeout(() => {
      let result: AiInsight | null = null;
      if (kind === "prospect") {
        const p = data.prospects.find((x) => x.id === selectedId);
        if (p) result = prospectInsight(p, data.activities);
      } else {
        const c = data.clients.find((x) => x.id === selectedId);
        if (c) result = clientInsight(c, data.opportunities, data.activities);
      }
      setInsight(result);
      setLoading(false);
    }, 650);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="IA Comercial"
        description="Resúmenes automáticos y recomendaciones de siguiente acción"
      >
        <Badge variant="info" className="gap-1">
          <Sparkles className="h-3.5 w-3.5" /> Asistente
        </Badge>
      </PageHeader>

      {/* Briefing del negocio */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Resumen ejecutivo automático
          </CardTitle>
          <CardDescription>
            Análisis generado a partir del estado actual de tu CRM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed">{briefing.summary}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            {briefing.recommendations.map((r, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-lg border bg-background p-3"
              >
                <div className="mt-0.5">
                  <Lightbulb className="h-4 w-4 text-warning" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{r.title}</p>
                    <Badge variant={priorityVariant[r.priority]} className="shrink-0">
                      {r.priority}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.detail}
                  </p>
                </div>
              </div>
            ))}
            {briefing.recommendations.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay alertas: tu operación está al día. 🎉
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Analizador */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Analizar cuenta con IA</CardTitle>
            <CardDescription>
              Genera un resumen y la siguiente mejor acción para un prospecto o cliente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                value={kind}
                onValueChange={(v) => {
                  setKind(v as "prospect" | "client");
                  setSelectedId("");
                  setInsight(null);
                }}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospect">Prospecto</SelectItem>
                  <SelectItem value="client">Cliente</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecciona una cuenta..." />
                </SelectTrigger>
                <SelectContent>
                  {options.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={analyze} disabled={!selectedId || loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Analizar
              </Button>
            </div>

            {loading && (
              <div className="flex items-center gap-2 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando análisis...
              </div>
            )}

            {insight && !loading && (
              <div className="animate-fade-in space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={priorityVariant[insight.priority]}>
                    Prioridad {insight.priority}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Resumen
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{insight.summary}</p>
                </div>

                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-primary">
                    <ArrowRight className="h-3.5 w-3.5" /> Siguiente acción recomendada
                  </p>
                  <p className="mt-1 text-sm font-medium">{insight.nextAction}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Señales detectadas
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {insight.signals.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {!insight && !loading && (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                Selecciona una cuenta y pulsa <strong>Analizar</strong> para
                obtener recomendaciones.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prospectos calientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="h-4 w-4 text-destructive" /> Prospectos calientes
            </CardTitle>
            <CardDescription>Score ≥ 75 sin convertir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {briefing.hotProspects.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Sin prospectos calientes por ahora.
              </p>
            )}
            {briefing.hotProspects.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setKind("prospect");
                  setSelectedId(p.id);
                  setInsight(prospectInsight(p, data.activities));
                }}
                className="flex w-full items-center justify-between gap-2 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.company}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.name} · {formatCurrency(p.estimatedValue)}
                  </p>
                </div>
                <Badge variant="destructive" className="shrink-0">
                  {p.score}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Los análisis se generan con un motor de reglas local. En producción,
        este módulo puede conectarse a un LLM (ej. Claude) conservando la misma interfaz.
      </p>
    </div>
  );
}
