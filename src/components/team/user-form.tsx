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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { ROLE_LABEL, type Role, type User } from "@/lib/types";
import { getInitials } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
}

const empty = {
  name: "",
  email: "",
  role: "ejecutivo" as Role,
  goal: 600000,
  avatar: "",
};

export function UserForm({ open, onOpenChange, user }: Props) {
  const { addUser, updateUser } = useStore();
  const { toast } = useToast();
  const [form, setForm] = React.useState(empty);

  React.useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        role: user.role,
        goal: user.goal,
        avatar: user.avatar,
      });
    } else {
      setForm(empty);
    }
  }, [user, open]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Avatar generado a partir del nombre si no se indica uno.
  const previewAvatar =
    form.avatar ||
    (form.name
      ? `https://avatar.vercel.sh/${encodeURIComponent(form.name)}.svg?text=${encodeURIComponent(getInitials(form.name))}`
      : "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ variant: "destructive", title: "El nombre es obligatorio" });
      return;
    }
    if (!form.email.trim()) {
      toast({ variant: "destructive", title: "El correo es obligatorio" });
      return;
    }
    const payload = { ...form, avatar: previewAvatar };
    if (user) {
      updateUser(user.id, payload);
      toast({ variant: "success", title: "Ejecutivo actualizado" });
    } else {
      addUser(payload);
      toast({ variant: "success", title: "Ejecutivo agregado" });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {user ? "Editar ejecutivo" : "Nuevo ejecutivo"}
          </DialogTitle>
          <DialogDescription>
            Los ejecutivos pueden ser asignados a prospectos, clientes,
            oportunidades, actividades y cotizaciones.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={previewAvatar} alt={form.name} />
              <AvatarFallback>
                {form.name ? getInitials(form.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground">
              El avatar se genera automáticamente a partir del nombre.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Nombre completo *</Label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ej. Laura Méndez"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Correo *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="laura.mendez@flowcrm.io"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Select
                value={form.role}
                onValueChange={(v) => set("role", v as Role)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Meta mensual (MXN)</Label>
              <Input
                type="number"
                min={0}
                step={10000}
                value={form.goal}
                onChange={(e) => set("goal", Number(e.target.value))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {user ? "Guardar cambios" : "Agregar ejecutivo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
