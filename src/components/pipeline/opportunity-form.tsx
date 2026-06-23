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
  LEAD_SOURCE_LABEL,
  PIPELINE_STAGES,
  type LeadSource,
  type Opportunity,
  type PipelineStage,
} from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity?: Opportunity | null;
  defaultStage?: PipelineStage;
}

export function OpportunityForm({
  open,
  onOpenChange,
  opportunity,
  defaultStage = "prospeccion",
}: Props) {
  const { users, clients, addOpportunity, updateOpportunity, currentUserId } =
    useStore();
  const { toast } = useToast();

  const [form, setForm] = React.useState({
    title: "",
    accountName: "",
    clientId: "",
    value: 50000,
    stage: defaultStage as PipelineStage,
    probability: 15,
    source: "web" as LeadSource,
    expectedCloseDate: "2026-07-31",
    ownerId: currentUserId,
  });

  React.useEffect(() => {
    if (opportunity) {
      setForm({
        title: opportunity.title,
        accountName: opportunity.accountName,
        clientId: opportunity.clientId ?? "",
        value: opportunity.value,
        stage: opportunity.stage,
        probability: opportunity.probability,
        source: opportunity.source,
        expectedCloseDate: opportunity.expectedCloseDate.slice(0, 10),
        ownerId: opportunity.ownerId,
      });
    } else {
      setForm((f) => ({
        ...f,
        title: "",
        accountName: "",
        clientId: "",
        value: 50000,
        stage: defaultStage,
        probability: 15,
        ownerId: currentUserId,
      }));
    }
  }, [opportunity, open, defaultStage, currentUserId]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.accountName.trim()) {
      toast({ variant: "destructive", title: "Título y cuenta son obligatorios" });
      return;
    }
    const payload = {
      ...form,
      expectedCloseDate: new Date(form.expectedCloseDate).toISOString(),
      clientId: form.clientId || undefined,
    };
    if (opportunity) {
      updateOpportunity(opportunity.id, payload);
      toast({ variant: "success", title: "Oportunidad actualizada" });
    } else {
      addOpportunity(payload);
      toast({ variant: "success", title: "Oportunidad creada" });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {opportunity ? "Editar oportunidad" : "Nueva oportunidad"}
          </DialogTitle>
          <DialogDescription>
            Registra una oportunidad de venta en el pipeline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Título *</Label>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ej. Implementación CRM — Grupo Vértice"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Cuenta / Cliente *</Label>
            <Input
              value={form.accountName}
              onChange={(e) => set("accountName", e.target.value)}
              placeholder="Nombre de la empresa"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Vincular cliente</Label>
            <Select
              value={form.clientId || "none"}
              onValueChange={(v) => {
                const c = clients.find((x) => x.id === v);
                set("clientId", v === "none" ? "" : v);
                if (c) set("accountName", c.company);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin vincular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin vincular</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Valor (MXN)</Label>
            <Input
              type="number"
              min={0}
              step={1000}
              value={form.value}
              onChange={(e) => set("value", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Etapa</Label>
            <Select
              value={form.stage}
              onValueChange={(v) => set("stage", v as PipelineStage)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PIPELINE_STAGES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Probabilidad: {form.probability}%</Label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={form.probability}
              onChange={(e) => set("probability", Number(e.target.value))}
              className="h-9 w-full cursor-pointer accent-[hsl(var(--primary))]"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Cierre estimado</Label>
            <Input
              type="date"
              value={form.expectedCloseDate}
              onChange={(e) => set("expectedCloseDate", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Fuente</Label>
            <Select
              value={form.source}
              onValueChange={(v) => set("source", v as LeadSource)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LEAD_SOURCE_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Ejecutivo</Label>
            <Select
              value={form.ownerId}
              onValueChange={(v) => set("ownerId", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {opportunity ? "Guardar" : "Crear oportunidad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
