"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  /** Fecha mínima/máxima seleccionable */
  fromDate?: Date;
  toDate?: Date;
  className?: string;
}

const WEEKDAYS = ["lu", "ma", "mi", "ju", "vi", "sá", "do"];

export function Calendar({
  selected,
  onSelect,
  fromDate,
  toDate,
  className,
}: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(
    startOfMonth(selected ?? new Date("2026-06-22")),
  );

  React.useEffect(() => {
    if (selected) setMonth(startOfMonth(selected));
  }, [selected]);

  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  function isDisabled(day: Date) {
    if (fromDate && isBefore(startOfDay(day), startOfDay(fromDate))) return true;
    if (toDate && isAfter(startOfDay(day), startOfDay(toDate))) return true;
    return false;
  }

  const today = startOfDay(new Date("2026-06-22"));

  return (
    <div className={cn("w-[280px] p-3", className)}>
      {/* Cabecera mes */}
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Mes anterior"
          onClick={() => setMonth((m) => subMonths(m, 1))}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-7 w-7",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold capitalize">
          {format(month, "MMMM yyyy", { locale: es })}
        </span>
        <button
          type="button"
          aria-label="Mes siguiente"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-7 w-7",
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="mb-1 grid grid-cols-7">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="flex h-8 items-center justify-center text-[11px] font-medium uppercase text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grilla de días */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const outside = !isSameMonth(day, month);
          const isSelected = selected && isSameDay(day, selected);
          const isToday = isSameDay(day, today);
          const disabled = isDisabled(day);
          return (
            <button
              type="button"
              key={day.toISOString()}
              disabled={disabled}
              onClick={() => onSelect?.(day)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                outside && "text-muted-foreground/40",
                isToday &&
                  !isSelected &&
                  "font-semibold text-primary ring-1 ring-inset ring-primary/40",
                isSelected &&
                  "bg-primary font-semibold text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                disabled &&
                  "pointer-events-none text-muted-foreground/30 line-through",
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
