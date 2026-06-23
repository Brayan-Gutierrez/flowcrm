"use client";

import { Phone, Users, Mail, CheckSquare, type LucideIcon } from "lucide-react";
import { ACTIVITY_TYPE_LABEL, type Activity, type ActivityType } from "@/lib/types";
import { fromNow } from "@/lib/format";
import { cn } from "@/lib/utils";

const ICONS: Record<ActivityType, LucideIcon> = {
  llamada: Phone,
  reunion: Users,
  correo: Mail,
  tarea: CheckSquare,
};

const COLORS: Record<ActivityType, string> = {
  llamada: "bg-sky-500/10 text-sky-600",
  reunion: "bg-violet-500/10 text-violet-600",
  correo: "bg-amber-500/10 text-amber-600",
  tarea: "bg-emerald-500/10 text-emerald-600",
};

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  const sorted = [...activities].sort(
    (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Sin actividades registradas.
      </p>
    );
  }

  return (
    <ol className="relative space-y-5 pl-2">
      {sorted.map((a, i) => {
        const Icon = ICONS[a.type];
        return (
          <li key={a.id} className="relative flex gap-3">
            {i < sorted.length - 1 && (
              <span className="absolute left-[15px] top-9 h-[calc(100%-4px)] w-px bg-border" />
            )}
            <div
              className={cn(
                "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                COLORS[a.type],
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-x-2">
                <p className="text-sm font-medium">{a.subject}</p>
                <span className="text-xs text-muted-foreground">
                  · {ACTIVITY_TYPE_LABEL[a.type]}
                </span>
                {a.completed && (
                  <span className="text-xs font-medium text-success">
                    Completada
                  </span>
                )}
              </div>
              {a.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {a.description}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {fromNow(a.dueDate)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
