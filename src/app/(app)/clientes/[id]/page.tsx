"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Plus,
  Briefcase,
  FileText,
  Sparkles,
  CalendarCheck,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ClientForm } from "@/components/clients/client-form";
import { ActivityForm } from "@/components/activities/activity-form";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { ClientStatusBadge, StageBadge, QuoteStatusBadge } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useStore, useUserMap } from "@/lib/store";
import { clientInsight } from "@/lib/ai";
import { quoteTotals } from "@/lib/analytics";
import { formatCurrency, getInitials } from "@/lib/utils";
import { formatDate } from "@/lib/format";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const store = useStore();
  const users = useUserMap();
  const [editOpen, setEditOpen] = React.useState(false);
  const [activityOpen, setActivityOpen] = React.useState(false);

  const client = store.clients.find((c) => c.id === params.id);

  const insight = React.useMemo(
    () =>
      client
        ? clientInsight(client, store.opportunities, store.activities)
        : null,
    [client, store.opportunities, store.activities],
  );

  if (!client) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push("/clientes")}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            Cliente no encontrado.
          </CardContent>
        </Card>
      </div>
    );
  }

  const ai = insight!;
  const owner = users[client.ownerId];
  const opps = store.opportunities.filter((o) => o.clientId === client.id);
  const activities = store.activities.filter(
    (a) => a.relatedType === "client" && a.relatedId === client.id,
  );
  const quotes = store.quotes.filter((q) => q.clientId === client.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/clientes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">Clientes / {client.company}</span>
      </div>

      {/* Cabecera */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  {client.company}
                </h1>
                <ClientStatusBadge status={client.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {client.name} · {client.industry}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActivityOpen(true)}>
              <Plus className="h-4 w-4" /> Actividad
            </Button>
            <Button onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" /> Editar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow icon={Mail} label="Correo" value={client.email} />
              <InfoRow icon={Phone} label="Teléfono" value={client.phone} />
              {client.address && (
                <InfoRow icon={MapPin} label="Dirección" value={client.address} />
              )}
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-muted-foreground">Valor total</span>
                <span className="font-semibold">
                  {formatCurrency(client.totalValue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cliente desde</span>
                <span>{formatDate(client.createdAt)}</span>
              </div>
              {owner && (
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-muted-foreground">Ejecutivo</span>
                  <span className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={owner.avatar} alt={owner.name} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(owner.name)}
                      </AvatarFallback>
                    </Avatar>
                    {owner.name}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumen IA */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" /> Resumen IA
                <Badge
                  variant={ai.priority === "alta" ? "destructive" : "info"}
                  className="ml-auto"
                >
                  Prioridad {ai.priority}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{ai.summary}</p>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs font-semibold uppercase text-primary">
                  Siguiente acción recomendada
                </p>
                <p className="mt-1">{ai.nextAction}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">
                <CalendarCheck className="mr-1.5 h-4 w-4" /> Timeline
              </TabsTrigger>
              <TabsTrigger value="oportunidades">
                <Briefcase className="mr-1.5 h-4 w-4" /> Oportunidades
              </TabsTrigger>
              <TabsTrigger value="cotizaciones">
                <FileText className="mr-1.5 h-4 w-4" /> Cotizaciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Historial de actividades
                  </CardTitle>
                  <CardDescription>
                    {activities.length} interacción(es) registradas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityTimeline activities={activities} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="oportunidades">
              <Card>
                <CardContent className="space-y-3 p-4">
                  {opps.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Sin oportunidades para este cliente.
                    </p>
                  ) : (
                    opps.map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between gap-2 rounded-lg border p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {o.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Cierre: {formatDate(o.expectedCloseDate)} · {o.probability}%
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-semibold">
                            {formatCurrency(o.value)}
                          </span>
                          <StageBadge stage={o.stage} />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cotizaciones">
              <Card>
                <CardContent className="space-y-3 p-4">
                  {quotes.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Sin cotizaciones para este cliente.
                    </p>
                  ) : (
                    quotes.map((q) => {
                      const { total } = quoteTotals(q);
                      return (
                        <div
                          key={q.id}
                          className="flex items-center justify-between gap-2 rounded-lg border p-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {q.number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(q.createdAt)} · {q.items.length} concepto(s)
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-semibold">
                              {formatCurrency(total)}
                            </span>
                            <QuoteStatusBadge status={q.status} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ClientForm open={editOpen} onOpenChange={setEditOpen} client={client} />
      <ActivityForm
        open={activityOpen}
        onOpenChange={setActivityOpen}
        presetRelated={{
          relatedType: "client",
          relatedId: client.id,
          relatedName: client.company,
        }}
      />
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate">{value}</p>
      </div>
    </div>
  );
}
