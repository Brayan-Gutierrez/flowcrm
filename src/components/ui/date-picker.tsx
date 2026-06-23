"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  /** Valor en formato yyyy-mm-dd */
  value?: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
}

function parse(value?: string) {
  if (!value) return undefined;
  // Interpreta yyyy-mm-dd como fecha local (evita desfase por zona horaria)
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

function toIso(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Seleccionar fecha",
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parse(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 w-[160px] justify-start gap-2 font-normal",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          {selected ? (
            <span className="capitalize">
              {format(selected, "d MMM yyyy", { locale: es })}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Calendar
          selected={selected}
          fromDate={parse(min)}
          toDate={parse(max)}
          onSelect={(date) => {
            onChange(toIso(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
