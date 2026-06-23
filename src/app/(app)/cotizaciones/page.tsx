"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Download,
  FileText,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { QuoteForm } from "@/components/quotes/quote-form";
import { QuoteStatusBadge } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore, useUserMap, usePermissions } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { quoteTotals } from "@/lib/analytics";
import { exportQuotePdf } from "@/lib/pdf";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { QUOTE_STATUS_LABEL, type Quote } from "@/lib/types";

export default function CotizacionesPage() {
  const { quotes, deleteQuote } = useStore();
  const users = useUserMap();
  const { canDelete } = usePermissions();
  const { toast } = useToast();

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("todos");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Quote | null>(null);

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase();
    return quotes.filter((quote) => {
      const matchesSearch =
        quote.number.toLowerCase().includes(q) ||
        quote.accountName.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "todos" || quote.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [quotes, search, statusFilter]);

  const totalValue = React.useMemo(
    () => quotes.reduce((s, q) => s + quoteTotals(q).total, 0),
    [quotes],
  );

  async function handleDownload(q: Quote) {
    try {
      await exportQuotePdf(q, users[q.ownerId]);
      toast({ variant: "success", title: "PDF generado", description: q.number });
    } catch {
      toast({ variant: "destructive", title: "No se pudo generar el PDF" });
    }
  }

  const columns = React.useMemo<ColumnDef<Quote>[]>(
    () => [
      {
        accessorKey: "number",
        header: "Número",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.number}</span>
        ),
      },
      {
        accessorKey: "accountName",
        header: "Cliente",
        cell: ({ row }) => row.original.accountName,
      },
      {
        id: "items",
        header: "Conceptos",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.items.length}
          </span>
        ),
      },
      {
        id: "total",
        header: "Total",
        accessorFn: (q) => quoteTotals(q).total,
        cell: ({ row }) => (
          <span className="font-semibold">
            {formatCurrency(quoteTotals(row.original).total)}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Fecha",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => <QuoteStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const q = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleDownload(q)}
                title="Descargar PDF"
              >
                <Download className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditing(q);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload(q)}>
                    <Download className="h-4 w-4" /> Descargar PDF
                  </DropdownMenuItem>
                  {canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          deleteQuote(q.id);
                          toast({ title: "Cotización eliminada" });
                        }}
                      >
                        <Trash2 className="h-4 w-4" /> Eliminar
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users, canDelete],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cotizaciones"
        description={`${quotes.length} cotizaciones · ${formatCurrency(totalValue)} en propuestas`}
      >
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Nueva cotización
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número o cliente..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              {Object.entries(QUOTE_STATUS_LABEL).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={filtered}
        emptyState={
          <EmptyState
            icon={FileText}
            title="Sin cotizaciones"
            description="Crea tu primera cotización y expórtala a PDF."
          >
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Nueva cotización
            </Button>
          </EmptyState>
        }
      />

      <QuoteForm open={formOpen} onOpenChange={setFormOpen} quote={editing} />
    </div>
  );
}
