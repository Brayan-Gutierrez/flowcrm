"use client";

import * as React from "react";
import { Upload, Trash2 } from "lucide-react";
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

/** Reescala una imagen a `max` px (lado mayor) y la devuelve como data URL JPEG. */
function resizeImage(file: File, max = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("sin contexto de canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProfileDialog({ open, onOpenChange }: Props) {
  const user = useCurrentUser();
  const { updateUser } = useStore();
  const { toast } = useToast();
  const fileRef = React.useRef<HTMLInputElement>(null);

  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [avatar, setAvatar] = React.useState(user.avatar);

  React.useEffect(() => {
    if (open) {
      setName(user.name);
      setEmail(user.email);
      setAvatar(user.avatar);
    }
  }, [open, user]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "El archivo debe ser una imagen" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "La imagen supera los 5 MB" });
      return;
    }
    try {
      const dataUrl = await resizeImage(file);
      setAvatar(dataUrl);
    } catch {
      toast({ variant: "destructive", title: "No se pudo procesar la imagen" });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({ variant: "destructive", title: "Nombre y correo son obligatorios" });
      return;
    }
    updateUser(user.id, { name, email, avatar });
    toast({ variant: "success", title: "Perfil actualizado" });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mi perfil</DialogTitle>
          <DialogDescription>
            Actualiza tu foto y tus datos de contacto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Foto de perfil */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="text-lg">
                {getInitials(name) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-4 w-4" /> Cambiar foto
                </Button>
                {avatar && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setAvatar("")}
                  >
                    <Trash2 className="h-4 w-4" /> Quitar
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                JPG o PNG, máx 5 MB. Se ajusta automáticamente.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">{ROLE_LABEL[user.role]}</Badge>
            <span className="text-xs text-muted-foreground">
              Meta mensual: {formatCurrency(user.goal)}
            </span>
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
