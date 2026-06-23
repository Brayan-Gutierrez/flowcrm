"use client";

import { Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, getInitials } from "@/lib/utils";
import type { User } from "@/lib/types";

interface RankRow {
  user: User;
  deals: number;
  wonValue: number;
  attainment: number;
}

export function ExecutiveRanking({ data }: { data: RankRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-warning" />
          Ranking de ejecutivos
        </CardTitle>
        <CardDescription>Cumplimiento de meta mensual</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((row, i) => (
          <div key={row.user.id} className="flex items-center gap-3">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                i === 0
                  ? "bg-warning/20 text-warning"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </span>
            <Avatar className="h-9 w-9">
              <AvatarImage src={row.user.avatar} alt={row.user.name} />
              <AvatarFallback>{getInitials(row.user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">{row.user.name}</p>
                <p className="shrink-0 text-sm font-semibold">
                  {formatCurrency(row.wonValue)}
                </p>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <Progress
                  value={Math.min(100, row.attainment)}
                  className="h-1.5"
                  indicatorClassName={
                    row.attainment >= 100 ? "bg-success" : "bg-primary"
                  }
                />
                <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
                  {row.attainment.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
