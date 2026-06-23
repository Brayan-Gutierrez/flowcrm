"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { usePermissions } from "@/lib/store";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { role } = usePermissions();
  const items = NAV_ITEMS.filter(
    (item) => !item.permission || can(role, item.permission),
  );

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight">FlowCRM</p>
          <p className="text-[11px] text-muted-foreground">CRM para PYMES</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin p-3">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-accent-foreground",
                )}
              />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Pie */}
      <div className="border-t p-4">
        <div className="rounded-lg bg-gradient-to-br from-primary/10 to-accent p-3">
          <p className="text-xs font-semibold">Plan Pro</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Demo interactiva — datos de ejemplo
          </p>
        </div>
      </div>
    </div>
  );
}
