"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { quoteTotals } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";
import {
  QUOTE_STATUS_LABEL,
  type Quote,
  type QuoteItem,
  type QuoteStatus,
} from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote?: Quote | null;
}

let itemSeq = 0;
const newItem = (): QuoteItem => ({
  id: `new_${itemSeq++}`,
  description: "",
  quantity: 1,
  unitPrice: 0,
});

export function QuoteForm({ open, onOpenChange, quote }: Props) {
  const { clients, addQuote, updateQuote, currentUserId } = useStore();
  const { toast } = useToast();

  const [accountName, setAccountName] = React.useState("");
  const [clientId, setClientId] = React.useState("");
  const [status, setStatus] = React.useState<QuoteStatus>("borrador");
  const [taxRate, setTaxRate] = React.useState(16);
  const [validUntil, setValidUntil] = React.useState("2026-07-31");
  const [notes, setNotes] = React.useState(
    "Precios en MXN. Vigencia sujeta a disponibilidad.",
  );
  const [items, setItems] = React.useState<QuoteItem[]>([newItem()]);

  React.useEffect(() => {
    if (quote) {
      setAccountName(quote.accountName);
      setClientId(quote.clientId ?? "");
      setStatus(quote.status);
      setTaxRate(quote.taxRate);
      setValidUntil(quote.validUntil.slice(0, 10));
      setNotes(quote.notes);
      setItems(quote.items.length ? quote.items : [newItem()]);
    } else {
      setAccountName("");
      setClientId("");
      setStatus("borrador");
      setTaxRate(16);
      setValidUntil("2026-07-31");
      setNotes("Precios en MXN. Vigencia sujeta a disponibilidad.");
      setItems([newItem()]);
    }
  }, [quote, open]);

  const totals = quoteTotals({ items, taxRate });

  function setItem(id: string, patch: Partial<QuoteItem>) {
    setItems((arr) => arr.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }
  function removeItem(id: string) {
    setItems((arr) => (arr.length > 1 ? arr.filter((it) => it.id !== id) : arr));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountName.trim()) {
      toast({ variant: "destructive", title: "El cliente es obligatorio" });
      return;
    }
    const cleanItems = items.filter((it) => it.description.trim());
    if (cleanItems.length === 0) {
      toast({ variant: "destructive", title: "Agrega al menos un concepto" });
      return;
    }
    const payload = {
      accountName,
      clientId: clientId || undefined,
      status,
      taxRate,
      validUntil: new Date(validUntil).toISOString(),
      notes,
      items: cleanItems,
      ownerId: currentUserId,
    };
    if (quote) {
      updateQuote(quote.id, payload);
      toast({ variant: "success", title: "Cotización actualizada" });
    } else {
      addQuote(payload);
      toast({ variant: "success", title: "Cotización creada" });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {quote ? `Editar ${quote.number}` : "Nueva cotización"}
          </DialogTitle>
          <DialogDescription>
            Arma la propuesta comercial y expórtala a PDF.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Cliente *</Label>
              <Input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Nombre de la empresa"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Vincular cliente</Label>
              <Select
                value={clientId || "none"}
                onValueChange={(v) => {
                  const c = clients.find((x) => x.id === v);
                  setClientId(v === "none" ? "" : v);
                  if (c) setAccountName(c.company);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin vincular" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin vincular</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as QuoteStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(QUOTE_STATUS_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Válida hasta</Label>
              <DatePicker
                className="w-full"
                value={validUntil}
                onChange={setValidUntil}
              />
            </div>
          </div>

          <Separator />

          {/* Conceptos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Conceptos</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setItems((a) => [...a, newItem()])}
              >
                <Plus className="h-4 w-4" /> Agregar
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="grid grid-cols-12 items-center gap-2"
                >
                  <Input
                    className="col-span-6"
                    placeholder="Descripción del concepto"
                    value={it.description}
                    onChange={(e) =>
                      setItem(it.id, { description: e.target.value })
                    }
                  />
                  <Input
                    className="col-span-2"
                    type="number"
                    min={1}
                    value={it.quantity}
                    onChange={(e) =>
                      setItem(it.id, { quantity: Number(e.target.value) })
                    }
                  />
                  <Input
                    className="col-span-3"
                    type="number"
                    min={0}
                    step={100}
                    value={it.unitPrice}
                    onChange={(e) =>
                      setItem(it.id, { unitPrice: Number(e.target.value) })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="col-span-1 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(it.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totales */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full max-w-[160px] space-y-1.5">
              <Label>IVA (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
              />
            </div>
            <div className="w-full max-w-xs space-y-1 rounded-lg border bg-muted/40 p-3 text-sm">
              <Row label="Subtotal" value={formatCurrency(totals.subtotal)} />
              <Row label={`IVA (${taxRate}%)`} value={formatCurrency(totals.tax)} />
              <Separator className="my-1" />
              <Row label="Total" value={formatCurrency(totals.total)} bold />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notas</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">{quote ? "Guardar" : "Crear cotización"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${bold ? "text-base font-semibold" : "text-muted-foreground"}`}
    >
      <span>{label}</span>
      <span className={bold ? "text-foreground" : ""}>{value}</span>
    </div>
  );
}
