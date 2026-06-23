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
import { CLIENT_STATUS_LABEL, type Client, type ClientStatus } from "@/lib/types";

const INDUSTRIES = [
  "Tecnología", "Retail", "Manufactura", "Salud", "Servicios",
  "Construcción", "Agroindustria", "Educación", "Logística", "Finanzas",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

export function ClientForm({ open, onOpenChange, client }: Props) {
  const { users, addClient, updateClient, currentUserId } = useStore();
  const { toast } = useToast();

  const [form, setForm] = React.useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    industry: "Servicios",
    status: "activo" as ClientStatus,
    totalValue: 100000,
    address: "",
    ownerId: currentUserId,
  });

  React.useEffect(() => {
    if (client) {
      setForm({
        name: client.name,
        company: client.company,
        email: client.email,
        phone: client.phone,
        industry: client.industry,
        status: client.status,
        totalValue: client.totalValue,
        address: client.address ?? "",
        ownerId: client.ownerId,
      });
    } else {
      setForm((f) => ({
        ...f,
        name: "",
        company: "",
        email: "",
        phone: "",
        totalValue: 100000,
        address: "",
        ownerId: currentUserId,
      }));
    }
  }, [client, open, currentUserId]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim()) {
      toast({ variant: "destructive", title: "La empresa es obligatoria" });
      return;
    }
    if (client) {
      updateClient(client.id, form);
      toast({ variant: "success", title: "Cliente actualizado" });
    } else {
      addClient(form);
      toast({ variant: "success", title: "Cliente creado" });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{client ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
          <DialogDescription>
            Información de la cuenta y datos de contacto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Empresa *</Label>
            <Input
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Contacto principal</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Correo</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Teléfono</Label>
            <Input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Industria</Label>
            <Select
              value={form.industry}
              onValueChange={(v) => set("industry", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Select
              value={form.status}
              onValueChange={(v) => set("status", v as ClientStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CLIENT_STATUS_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Valor total (MXN)</Label>
            <Input
              type="number"
              min={0}
              step={1000}
              value={form.totalValue}
              onChange={(e) => set("totalValue", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Ejecutivo</Label>
            <Select value={form.ownerId} onValueChange={(v) => set("ownerId", v)}>
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
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Dirección</Label>
            <Input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">{client ? "Guardar" : "Crear cliente"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
