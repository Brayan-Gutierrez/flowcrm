import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Sparkles className="h-6 w-6" />
      </div>
      <h1 className="text-4xl font-bold">404</h1>
      <p className="max-w-sm text-muted-foreground">
        La página que buscas no existe o fue movida.
      </p>
      <Button asChild>
        <Link href="/dashboard">Ir al dashboard</Link>
      </Button>
    </div>
  );
}
