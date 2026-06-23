"use client";

import * as React from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Plus, MoreVertical, Pencil, Trash2, GripVertical } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { OpportunityForm } from "@/components/pipeline/opportunity-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore, useUserMap, usePermissions } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { formatCompact, formatCurrency, getInitials } from "@/lib/utils";
import {
  PIPELINE_STAGES,
  type Opportunity,
  type PipelineStage,
} from "@/lib/types";

export default function PipelinePage() {
  const { opportunities, moveOpportunity, deleteOpportunity } = useStore();
  const users = useUserMap();
  const { canDelete } = usePermissions();
  const { toast } = useToast();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Opportunity | null>(null);
  const [defaultStage, setDefaultStage] =
    React.useState<PipelineStage>("prospeccion");

  const grouped = React.useMemo(() => {
    const map: Record<PipelineStage, Opportunity[]> = {
      prospeccion: [],
      calificacion: [],
      propuesta: [],
      negociacion: [],
      ganada: [],
      perdida: [],
    };
    opportunities.forEach((o) => map[o.stage].push(o));
    return map;
  }, [opportunities]);

  function onDragEnd(result: DropResult) {
    const { destination, draggableId, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    const stage = destination.droppableId as PipelineStage;
    moveOpportunity(draggableId, stage);
    const opp = opportunities.find((o) => o.id === draggableId);
    toast({
      variant: stage === "ganada" ? "success" : "default",
      title: stage === "ganada" ? "¡Oportunidad ganada! 🎉" : "Oportunidad movida",
      description: opp
        ? `${opp.title} → ${PIPELINE_STAGES.find((s) => s.id === stage)?.label}`
        : undefined,
    });
  }

  function openNew(stage: PipelineStage) {
    setEditing(null);
    setDefaultStage(stage);
    setFormOpen(true);
  }
  function openEdit(o: Opportunity) {
    setEditing(o);
    setFormOpen(true);
  }

  const totalPipeline = opportunities
    .filter((o) => o.stage !== "ganada" && o.stage !== "perdida")
    .reduce((s, o) => s + o.value, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline de ventas"
        description={`${opportunities.length} oportunidades · ${formatCurrency(totalPipeline)} en pipeline abierto`}
      >
        <Button onClick={() => openNew("prospeccion")}>
          <Plus className="h-4 w-4" /> Nueva oportunidad
        </Button>
      </PageHeader>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {PIPELINE_STAGES.map((stage) => {
            const items = grouped[stage.id];
            const total = items.reduce((s, o) => s + o.value, 0);
            return (
              <div key={stage.id} className="flex w-[300px] shrink-0 flex-col">
                {/* Encabezado columna */}
                <div className="mb-3 flex items-center justify-between rounded-lg border bg-card px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="text-sm font-semibold">{stage.label}</span>
                    <Badge variant="secondary" className="h-5 px-1.5">
                      {items.length}
                    </Badge>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {formatCompact(total)}
                  </span>
                </div>

                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex min-h-[120px] flex-1 flex-col gap-2 rounded-lg p-1 transition-colors ${
                        snapshot.isDraggingOver ? "bg-accent/60" : ""
                      }`}
                    >
                      {items.map((o, index) => {
                        const owner = users[o.ownerId];
                        return (
                          <Draggable
                            key={o.id}
                            draggableId={o.id}
                            index={index}
                          >
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...(prov.draggableProps as React.HTMLAttributes<HTMLDivElement>)}
                                className={`group rounded-lg border bg-card p-3 shadow-sm transition-shadow ${
                                  snap.isDragging ? "shadow-lg ring-2 ring-primary/40" : ""
                                }`}
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <div
                                    {...prov.dragHandleProps}
                                    className="flex flex-1 items-start gap-1.5"
                                  >
                                    <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                                    <p className="text-sm font-medium leading-snug">
                                      {o.title}
                                    </p>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                                      >
                                        <MoreVertical className="h-3.5 w-3.5" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => openEdit(o)}>
                                        <Pencil className="h-4 w-4" /> Editar
                                      </DropdownMenuItem>
                                      {canDelete && (
                                        <>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => {
                                              deleteOpportunity(o.id);
                                              toast({ title: "Oportunidad eliminada" });
                                            }}
                                          >
                                            <Trash2 className="h-4 w-4" /> Eliminar
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                <p className="mt-1 pl-5 text-xs text-muted-foreground">
                                  {o.accountName}
                                </p>

                                <div className="mt-3 flex items-center justify-between pl-5">
                                  <span className="text-sm font-semibold">
                                    {formatCurrency(o.value)}
                                  </span>
                                  <Badge variant="outline" className="h-5">
                                    {o.probability}%
                                  </Badge>
                                </div>

                                {owner && (
                                  <div className="mt-2 flex items-center gap-1.5 pl-5">
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage src={owner.avatar} alt={owner.name} />
                                      <AvatarFallback className="text-[9px]">
                                        {getInitials(owner.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-[11px] text-muted-foreground">
                                      {owner.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}

                      <button
                        onClick={() => openNew(stage.id)}
                        className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed py-2 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <Plus className="h-3.5 w-3.5" /> Agregar
                      </button>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <OpportunityForm
        open={formOpen}
        onOpenChange={setFormOpen}
        opportunity={editing}
        defaultStage={defaultStage}
      />
    </div>
  );
}
