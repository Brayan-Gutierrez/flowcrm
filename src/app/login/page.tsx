"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStore } from "@/lib/store";
import { ROLE_LABEL } from "@/lib/types";
import { getInitials } from "@/lib/utils";

const roleVariant = {
  admin: "default",
  gerente: "info",
  ejecutivo: "secondary",
} as const;

export default function LoginPage() {
  const router = useRouter();
  const { users, login, sessionUserId, ready } = useStore();

  // Si ya hay sesión, entra directo.
  React.useEffect(() => {
    if (ready && sessionUserId) router.replace("/dashboard");
  }, [ready, sessionUserId, router]);

  function enterAs(id: string) {
    login(id);
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">FlowCRM</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Elige un perfil para iniciar sesión en la demo
          </p>
        </div>

        <Card>
          <CardContent className="space-y-2 p-3">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => enterAs(u.id)}
                className="group flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary hover:bg-accent"
              >
                <Avatar className="h-11 w-11">
                  <AvatarImage src={u.avatar} alt={u.name} />
                  <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{u.name}</p>
                    <Badge variant={roleVariant[u.role]}>
                      {ROLE_LABEL[u.role]}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {u.email}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            ))}
          </CardContent>
        </Card>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          El módulo <strong className="font-medium">Equipo</strong> solo es
          visible para el rol Administrador.
        </p>
      </div>
    </div>
  );
}
