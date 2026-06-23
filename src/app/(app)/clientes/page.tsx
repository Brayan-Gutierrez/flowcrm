"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Search, Building2, ArrowRight, Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ClientForm } from "@/components/clients/client-form";
import { ClientStatusBadge } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore, useUserMap } from "@/lib/store";
import { formatCurrency, getInitials } from "@/lib/utils";
import { CLIENT_STATUS_LABEL } from "@/lib/types";

export default function ClientesPage() {
  const { clients } = useStore();
  const users = useUserMap();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("todos");
  const [formOpen, setFormOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter((c) => {
      const matchesSearch =
        c.company.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "todos" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, search, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description={`${clients.length} cuentas activas en tu cartera`}
      >
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> Nuevo cliente
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
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
              {Object.entries(CLIENT_STATUS_LABEL).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Sin clientes"
          description="Crea un cliente o convierte un prospecto."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const owner = users[c.ownerId];
            return (
              <Card key={c.id} className="group transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{c.company}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.industry}
                        </p>
                      </div>
                    </div>
                    <ClientStatusBadge status={c.status} />
                  </div>

                  <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2 truncate">
                      <Mail className="h-3.5 w-3.5 shrink-0" /> {c.email}
                    </p>
                    <p className="flex items-center gap-2 truncate">
                      <Phone className="h-3.5 w-3.5 shrink-0" /> {c.phone}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Valor total</p>
                      <p className="font-semibold">
                        {formatCurrency(c.totalValue)}
                      </p>
                    </div>
                    {owner && (
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={owner.avatar} alt={owner.name} />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(owner.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                  >
                    <Link href={`/clientes/${c.id}`}>
                      Ver detalle <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ClientForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
