"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ProspectForm } from "@/components/prospects/prospect-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { ProspectStatusBadge, SourceBadge } from "@/components/shared/badges";
import { useStore, useUserMap } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, getInitials } from "@/lib/utils";
import {
  LEAD_SOURCE_LABEL,
  PROSPECT_STATUS_LABEL,
  type Prospect,
} from "@/lib/types";

export default function ProspectosPage() {
  const { prospects, deleteProspect, convertProspect } = useStore();
  const users = useUserMap();
  const { toast } = useToast();

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("todos");
  const [sourceFilter, setSourceFilter] = React.useState("todos");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Prospect | null>(null);

  const filtered = React.useMemo(() => {
    return prospects.filter((p) => {
      const matchesStatus =
        statusFilter === "todos" || p.status === statusFilter;
      const matchesSource =
        sourceFilter === "todos" || p.source === sourceFilter;
      return matchesStatus && matchesSource;
    });
  }, [prospects, statusFilter, sourceFilter]);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(p: Prospect) {
    setEditing(p);
    setFormOpen(true);
  }
  function handleConvert(p: Prospect) {
    const client = convertProspect(p.id);
    if (client) {
      toast({
        variant: "success",
        title: "Prospecto convertido",
        description: `${p.company} ahora es cliente.`,
      });
    }
  }
  function handleDelete(p: Prospect) {
    deleteProspect(p.id);
    toast({ title: "Prospecto eliminado", description: p.name });
  }

  const columns = React.useMemo<ColumnDef<Prospect>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Prospecto",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{getInitials(p.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.company}
                </p>
              </div>
            </div>
          );
        },
        filterFn: (row, _id, value) => {
          const p = row.original;
          const q = String(value).toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.company.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q)
          );
        },
      },
      {
        accessorKey: "email",
        header: "Contacto",
        cell: ({ row }) => (
          <div className="text-sm">
            <p className="truncate">{row.original.email}</p>
            <p className="text-xs text-muted-foreground">{row.original.phone}</p>
          </div>
        ),
      },
      {
        accessorKey: "source",
        header: "Fuente",
        cell: ({ row }) => <SourceBadge source={row.original.source} />,
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => <ProspectStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "score",
        header: "Score",
        cell: ({ row }) => {
          const s = row.original.score;
          const color =
            s >= 70 ? "text-success" : s >= 40 ? "text-warning" : "text-muted-foreground";
          return <span className={`font-semibold ${color}`}>{s}</span>;
        },
      },
      {
        accessorKey: "estimatedValue",
        header: "Valor est.",
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCurrency(row.original.estimatedValue)}
          </span>
        ),
      },
      {
        accessorKey: "ownerId",
        header: "Ejecutivo",
        cell: ({ row }) => {
          const u = users[row.original.ownerId];
          if (!u) return <span className="text-muted-foreground">—</span>;
          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={u.avatar} alt={u.name} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(u.name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm md:inline">{u.name}</span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEdit(p)}>
                  <Pencil className="h-4 w-4" /> Editar
                </DropdownMenuItem>
                {p.status !== "convertido" && (
                  <DropdownMenuItem onClick={() => handleConvert(p)}>
                    <UserCheck className="h-4 w-4" /> Convertir a cliente
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(p)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prospectos"
        description={`${prospects.length} leads en seguimiento`}
      >
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Nuevo prospecto
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, empresa o correo..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              {Object.entries(PROSPECT_STATUS_LABEL).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Fuente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las fuentes</SelectItem>
              {Object.entries(LEAD_SOURCE_LABEL).map(([k, v]) => (
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
        globalFilter={search}
        emptyState={
          <EmptyState
            icon={UserPlus}
            title="Sin prospectos"
            description="Ajusta los filtros o crea tu primer prospecto."
          >
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" /> Nuevo prospecto
            </Button>
          </EmptyState>
        }
      />

      <ProspectForm
        open={formOpen}
        onOpenChange={setFormOpen}
        prospect={editing}
      />
    </div>
  );
}
