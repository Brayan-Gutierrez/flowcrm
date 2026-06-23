"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { SidebarNav } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const router = useRouter();
  const { ready, sessionUserId } = useStore();

  // Guardia de sesión: sin usuario autenticado → al login.
  React.useEffect(() => {
    if (ready && !sessionUserId) router.replace("/login");
  }, [ready, sessionUserId, router]);

  // Mientras se resuelve la sesión o se redirige, evita parpadeo.
  if (!ready || !sessionUserId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="flex h-11 w-11 animate-pulse items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="text-sm">Cargando…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar fijo (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-background lg:block">
        <SidebarNav />
      </aside>

      {/* Drawer móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className={cn(
              "absolute inset-y-0 left-0 w-64 border-r bg-background shadow-xl",
              "animate-in slide-in-from-left duration-200",
            )}
          >
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Contenido */}
      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1400px] animate-fade-in p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
