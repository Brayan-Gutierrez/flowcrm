"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  AlarmClock,
  Handshake,
  Flame,
  BellOff,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";
import {
  getNotifications,
  type NotificationKind,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";

const ICONS: Record<NotificationKind, LucideIcon> = {
  actividad_vencida: AlarmClock,
  cierre_proximo: Handshake,
  negociacion: Handshake,
  prospecto_caliente: Flame,
};

const ICON_STYLES: Record<NotificationKind, string> = {
  actividad_vencida: "bg-destructive/10 text-destructive",
  cierre_proximo: "bg-success/10 text-success",
  negociacion: "bg-amber-500/10 text-amber-600",
  prospecto_caliente: "bg-violet-500/10 text-violet-600",
};

const SEEN_KEY = "flowcrm:notif-seen:v1";

export function NotificationsMenu() {
  const data = useStore();
  const notifications = React.useMemo(() => getNotifications(data), [data]);
  const count = notifications.length;

  // Marca de "leídas": se guardan los ids vistos para ocultar el badge rojo.
  const [seen, setSeen] = React.useState<Set<string>>(new Set());
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = window.localStorage.getItem(SEEN_KEY);
      if (raw) setSeen(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, []);

  // No leídas = notificaciones actuales que aún no se han visto.
  const unread = mounted
    ? notifications.filter((n) => !seen.has(n.id)).length
    : 0;

  function markAllSeen() {
    const ids = notifications.map((n) => n.id);
    setSeen(new Set(ids));
    try {
      window.localStorage.setItem(SEEN_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open && unread > 0) markAllSeen();
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Notificaciones${unread ? ` (${unread} sin leer)` : ""}`}
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[340px] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Notificaciones</span>
          {count > 0 && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
              {count} pendiente{count === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {count === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <BellOff className="h-7 w-7 text-muted-foreground" />
            <p className="text-sm font-medium">Todo al día</p>
            <p className="text-xs text-muted-foreground">
              No tienes alertas pendientes.
            </p>
          </div>
        ) : (
          <div className="max-h-[380px] overflow-y-auto scrollbar-thin py-1">
            {notifications.map((n) => {
              const Icon = ICONS[n.kind];
              return (
                <DropdownMenuItem key={n.id} asChild className="cursor-pointer p-0">
                  <Link
                    href={n.href}
                    className="flex items-start gap-3 px-3 py-2.5"
                  >
                    <div
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      ICON_STYLES[n.kind],
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {n.description}
                    </p>
                  </div>
                    {n.priority === "alta" && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-destructive" />
                    )}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
