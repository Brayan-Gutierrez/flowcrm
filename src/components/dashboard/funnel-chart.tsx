"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: { label: string; color: string; count: number; value: number }[];
}

export function FunnelChart({ data }: Props) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Funnel de ventas</CardTitle>
        <CardDescription>Oportunidades por etapa del pipeline</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((stage) => {
          const pct = (stage.count / max) * 100;
          return (
            <div key={stage.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{stage.label}</span>
                <span className="text-muted-foreground">
                  {stage.count} · {formatCurrency(stage.value)}
                </span>
              </div>
              <div className="h-7 w-full overflow-hidden rounded-md bg-muted">
                <div
                  className="flex h-full items-center justify-end rounded-md px-2 text-xs font-semibold text-white transition-all"
                  style={{
                    width: `${Math.max(pct, 8)}%`,
                    backgroundColor: stage.color,
                  }}
                >
                  {stage.count}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
