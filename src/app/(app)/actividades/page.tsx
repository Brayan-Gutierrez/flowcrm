"use client";

import * as React from "react";
import {
  Plus,
  Phone,
  Users,
  Mail,
  CheckSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ActivityForm } from "@/components/activities/activity-form";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore, useUserMap } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn, getInitials } from "@/lib/utils";
import { formatDate, isOverdue } from "@/lib/format";
import {
  ACTIVITY_TYPE_LABEL,
  type Activity,
  type ActivityType,
} from "@/lib/types";

const ICONS: Record<ActivityType, LucideIcon> = {
  llamada: Phone,
  reunion: Users,
  correo: Mail,
  tarea: CheckSquare,
};
const COLORS: Record<ActivityType, string> = {
  llamada: "bg-sky-500/10 text-sky-600",
  reunion: "bg-violet-500/10 text-violet-600",
  correo: "bg-amber-500/10 text-amber-600",
  tarea: "bg-emerald-500/10 text-emerald-600",
};

export default function ActividadesPage() {
  const { activities, toggleActivity, deleteActivity } = useStore();
  const users = useUserMap();
  const { toast } = useToast();

  const [typeFilter, setTypeFilter] = React.useState<string>("todas");
  const [view, setView] = React.useState<"pendientes" | "completadas" | "todas">(
    "pendientes",
  );
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Activity | null>(null);

  const stats = React.useMemo(() => {
    return {
      total: activities.length,
      pendientes: activities.filter((a) => !a.completed).length,
      vencidas: activities.filter((a) => !a.completed && isOverdue(a.dueDate))
        .length,
      completadas: activities.filter((a) => a.completed).length,
    };
  }, [activities]);

  const filtered = React.useMemo(() => {
    return activities
      .filter((a) => (typeFilter === "todas" ? true : a.type === typeFilter))
      .filter((a) =>
        view === "todas"
          ? true
          : view === "pendientes"
            ? !a.completed
            : a.completed,
      )
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      );
  }, [activities, typeFilter, view]);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(a: Activity) {
    setEditing(a);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Actividades"
        description="Agenda de llamadas, reuniones, correos y tareas"
      >
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Nueva actividad
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total" value={String(stats.total)} icon={CheckSquare} accent="primary" />
        <StatCard title="Pendientes" value={String(stats.pendientes)} icon={CheckSquare} accent="warning" />
        <StatCard title="Vencidas" value={String(stats.vencidas)} icon={CheckSquare} accent="violet" />
        <StatCard title="Completadas" value={String(stats.completadas)} icon={CheckSquare} accent="success" />
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList>
            <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
            <TabsTrigger value="completadas">Completadas</TabsTrigger>
            <TabsTrigger value="todas">Todas</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={typeFilter === "todas"} onClick={() => setTypeFilter("todas")}>
            Todas
          </FilterChip>
          {(Object.keys(ACTIVITY_TYPE_LABEL) as ActivityType[]).map((t) => (
            <FilterChip
              key={t}
              active={typeFilter === t}
              onClick={() => setTypeFilter(t)}
            >
              {ACTIVITY_TYPE_LABEL[t]}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Pista de uso */}
      {view !== "completadas" && filtered.length > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="flex h-4 w-4 items-center justify-center rounded border-2 border-muted-foreground/40" />
          Marca el cuadro de la izquierda para completar una actividad.
        </p>
      )}

      {/* Lista */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Sin actividades"
          description="No hay actividades que coincidan con los filtros."
        >
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> Nueva actividad
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => {
            const Icon = ICONS[a.type];
            const owner = users[a.ownerId];
            const overdue = !a.completed && isOverdue(a.dueDate);
            return (
              <Card key={a.id} className={cn(a.completed && "opacity-70")}>
                <CardContent className="flex items-center gap-3 p-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => toggleActivity(a.id)}
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                          a.completed
                            ? "border-success bg-success text-white"
                            : "border-muted-foreground/40 hover:border-primary hover:bg-primary/5",
                        )}
                        aria-label={
                          a.completed
                            ? "Marcar como pendiente"
                            : "Marcar como completada"
                        }
                      >
                        {a.completed && <CheckSquare className="h-3 w-3" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {a.completed
                        ? "Marcar como pendiente"
                        : "Marcar como completada"}
                    </TooltipContent>
                  </Tooltip>

                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      COLORS[a.type],
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm font-medium",
                        a.completed && "line-through",
                      )}
                    >
                      {a.subject}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.relatedName} · {ACTIVITY_TYPE_LABEL[a.type]}
                    </p>
                  </div>

                  <div className="hidden items-center gap-3 sm:flex">
                    <Badge variant={overdue ? "destructive" : "secondary"}>
                      {formatDate(a.dueDate)}
                    </Badge>
                    {owner && (
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={owner.avatar} alt={owner.name} />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(owner.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(a)}>
                        <Pencil className="h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleActivity(a.id)}>
                        <CheckSquare className="h-4 w-4" />
                        {a.completed ? "Marcar pendiente" : "Completar"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          deleteActivity(a.id);
                          toast({ title: "Actividad eliminada" });
                        }}
                      >
                        <Trash2 className="h-4 w-4" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ActivityForm
        open={formOpen}
        onOpenChange={setFormOpen}
        activity={editing}
      />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-background hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}
