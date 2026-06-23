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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStore, useCurrentUser } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { ROLE_LABEL } from "@/lib/types";
import { formatCurrency, getInitials } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: Props) {
  const user = useCurrentUser();
  const { updateUser } = useStore();
  const { toast } = useToast();

  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);

  React.useEffect(() => {
    if (open) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [open, user]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({ variant: "destructive", title: "Nombre y correo son obligatorios" });
      return;
    }
    updateUser(user.id, { name, email });
    toast({ variant: "success", title: "Perfil actualizado" });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mi perfil</DialogTitle>
          <DialogDescription>
            Actualiza tus datos de contacto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <Badge variant="secondary">{ROLE_LABEL[user.role]}</Badge>
              <p className="mt-1 text-xs text-muted-foreground">
                Meta mensual: {formatCurrency(user.goal)}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Nombre completo</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Correo</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <p className="rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground">
            El rol y la meta solo puede modificarlos un Administrador desde el
            módulo <strong>Equipo</strong>.
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
