"use client";

import { CalendarRange } from "lucide-react";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PERIOD_LABEL,
  type PeriodPreset,
} from "@/lib/analytics";

export interface PeriodState {
  preset: PeriodPreset;
  from: string; // yyyy-mm-dd (solo para "custom")
  to: string;
}

interface Props {
  value: PeriodState;
  onChange: (next: PeriodState) => void;
}

export function PeriodSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      <Select
        value={value.preset}
        onValueChange={(preset) =>
          onChange({ ...value, preset: preset as PeriodPreset })
        }
      >
        <SelectTrigger className="w-full sm:w-48">
          <CalendarRange className="mr-1 h-4 w-4 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(PERIOD_LABEL) as PeriodPreset[]).map((p) => (
            <SelectItem key={p} value={p}>
              {PERIOD_LABEL[p]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value.preset === "custom" && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs text-muted-foreground">Desde</Label>
            <DatePicker
              value={value.from}
              max={value.to}
              onChange={(from) => onChange({ ...value, from })}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Label className="text-xs text-muted-foreground">Hasta</Label>
            <DatePicker
              value={value.to}
              min={value.from}
              onChange={(to) => onChange({ ...value, to })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
