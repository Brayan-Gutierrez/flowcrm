import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NoAccess({
  message = "No tienes permisos para ver esta sección.",
}: {
  message?: string;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-2xl font-bold tracking-tight">403 · Sin acceso</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">Volver al dashboard</Link>
      </Button>
    </div>
  );
}
