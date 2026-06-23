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
import { useStore, usePermissions } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  LEAD_SOURCE_LABEL,
  PROSPECT_STATUS_LABEL,
  type LeadSource,
  type Prospect,
  type ProspectStatus,
} from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospect?: Prospect | null;
}

const empty = {
  name: "",
  company: "",
  email: "",
  phone: "",
  position: "",
  source: "web" as LeadSource,
  status: "nuevo" as ProspectStatus,
  estimatedValue: 50000,
  score: 50,
  notes: "",
};

export function ProspectForm({ open, onOpenChange, prospect }: Props) {
  const { users, addProspect, updateProspect, currentUserId } = useStore();
  const { canReassign } = usePermissions();
  const { toast } = useToast();
  const [form, setForm] = React.useState(empty);
  const [ownerId, setOwnerId] = React.useState(currentUserId);

  React.useEffect(() => {
    if (prospect) {
      setForm({
        name: prospect.name,
        company: prospect.company,
        email: prospect.email,
        phone: prospect.phone,
        position: prospect.position,
        source: prospect.source,
        status: prospect.status,
        estimatedValue: prospect.estimatedValue,
        score: prospect.score,
        notes: prospect.notes,
      });
      setOwnerId(prospect.ownerId);
    } else {
      setForm(empty);
      setOwnerId(currentUserId);
    }
  }, [prospect, open, currentUserId]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.company.trim()) {
      toast({ variant: "destructive", title: "Nombre y empresa son obligatorios" });
      return;
    }
    if (prospect) {
      updateProspect(prospect.id, { ...form, ownerId });
      toast({ variant: "success", title: "Prospecto actualizado" });
    } else {
      addProspect({ ...form, ownerId, lastContactAt: null });
      toast({ variant: "success", title: "Prospecto creado" });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {prospect ? "Editar prospecto" : "Nuevo prospecto"}
          </DialogTitle>
          <DialogDescription>
            Captura la información del lead para darle seguimiento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre completo" required>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ej. Lucía Martínez"
            />
          </Field>
          <Field label="Empresa" required>
            <Input
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              placeholder="Ej. TecnoSoluciones SA"
            />
          </Field>
          <Field label="Correo">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="correo@empresa.com"
            />
          </Field>
          <Field label="Teléfono">
            <Input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+52 55 1234 5678"
            />
          </Field>
          <Field label="Puesto">
            <Input
              value={form.position}
              onChange={(e) => set("position", e.target.value)}
              placeholder="Ej. Director Comercial"
            />
          </Field>
          <Field label="Valor estimado (MXN)">
            <Input
              type="number"
              min={0}
              step={1000}
              value={form.estimatedValue}
              onChange={(e) => set("estimatedValue", Number(e.target.value))}
            />
          </Field>
          <Field label="Fuente">
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
          </Field>
          <Field label="Estado">
            <Select
              value={form.status}
              onValueChange={(v) => set("status", v as ProspectStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROSPECT_STATUS_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Ejecutivo asignado">
            <Select
              value={ownerId}
              onValueChange={setOwnerId}
              disabled={!canReassign}
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
          </Field>
          <Field label={`Score: ${form.score}`}>
            <input
              type="range"
              min={0}
              max={100}
              value={form.score}
              onChange={(e) => set("score", Number(e.target.value))}
              className="h-9 w-full cursor-pointer accent-[hsl(var(--primary))]"
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Notas">
              <Textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Contexto, necesidades, próximos pasos..."
              />
            </Field>
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {prospect ? "Guardar cambios" : "Crear prospecto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}
