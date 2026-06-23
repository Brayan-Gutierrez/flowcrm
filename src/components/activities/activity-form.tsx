"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  ACTIVITY_TYPE_LABEL,
  type Activity,
  type ActivityType,
} from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: Activity | null;
  // Pre-relación (ej. desde la ficha de un cliente)
  presetRelated?: {
    relatedType: Activity["relatedType"];
    relatedId: string;
    relatedName: string;
  };
}

export function ActivityForm({
  open,
  onOpenChange,
  activity,
  presetRelated,
}: Props) {
  const { clients, prospects, addActivity, updateActivity, currentUserId } =
    useStore();
  const { toast } = useToast();

  const [form, setForm] = React.useState({
    type: "llamada" as ActivityType,
    subject: "",
    description: "",
    relatedType: "client" as Activity["relatedType"],
    relatedId: "",
    dueDate: "2026-06-23",
    completed: false,
    ownerId: currentUserId,
  });

  React.useEffect(() => {
    if (activity) {
      setForm({
        type: activity.type,
        subject: activity.subject,
        description: activity.description,
        relatedType: activity.relatedType,
        relatedId: activity.relatedId,
        dueDate: activity.dueDate.slice(0, 10),
        completed: activity.completed,
        ownerId: activity.ownerId,
      });
    } else if (presetRelated) {
      setForm((f) => ({
        ...f,
        subject: "",
        description: "",
        relatedType: presetRelated.relatedType,
        relatedId: presetRelated.relatedId,
        ownerId: currentUserId,
      }));
    } else {
      setForm((f) => ({
        ...f,
        subject: "",
        description: "",
        relatedId: "",
        ownerId: currentUserId,
      }));
    }
  }, [activity, presetRelated, open, currentUserId]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const relatedOptions =
    form.relatedType === "client"
      ? clients.map((c) => ({ id: c.id, name: c.company }))
      : prospects.map((p) => ({ id: p.id, name: `${p.name} — ${p.company}` }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject.trim()) {
      toast({ variant: "destructive", title: "El asunto es obligatorio" });
      return;
    }
    const related =
      presetRelated && !activity
        ? presetRelated
        : {
            relatedType: form.relatedType,
            relatedId: form.relatedId,
            relatedName:
              relatedOptions.find((o) => o.id === form.relatedId)?.name ??
              "Sin asignar",
          };

    const payload = {
      type: form.type,
      subject: form.subject,
      description: form.description,
      dueDate: new Date(form.dueDate).toISOString(),
      completed: form.completed,
      ownerId: form.ownerId,
      ...related,
    };

    if (activity) {
      updateActivity(activity.id, payload);
      toast({ variant: "success", title: "Actividad actualizada" });
    } else {
      addActivity(payload);
      toast({ variant: "success", title: "Actividad registrada" });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {activity ? "Editar actividad" : "Nueva actividad"}
          </DialogTitle>
          <DialogDescription>
            Programa una llamada, reunión, correo o tarea.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select
              value={form.type}
              onValueChange={(v) => set("type", v as ActivityType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACTIVITY_TYPE_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Fecha</Label>
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Asunto *</Label>
            <Input
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
              placeholder="Ej. Llamada de seguimiento"
            />
          </div>

          {!presetRelated && (
            <>
              <div className="space-y-1.5">
                <Label>Relacionado con</Label>
                <Select
                  value={form.relatedType}
                  onValueChange={(v) => {
                    set("relatedType", v as Activity["relatedType"]);
                    set("relatedId", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Cliente</SelectItem>
                    <SelectItem value="prospect">Prospecto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Cuenta</Label>
                <Select
                  value={form.relatedId}
                  onValueChange={(v) => set("relatedId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {relatedOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Descripción</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Detalles y próximos pasos..."
            />
          </div>

          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.completed}
              onChange={(e) => set("completed", e.target.checked)}
              className="h-4 w-4 accent-[hsl(var(--primary))]"
            />
            Marcar como completada
          </label>

          <DialogFooter className="sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {activity ? "Guardar" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
