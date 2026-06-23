"use client";

import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  UsersRound,
  Mail,
  Target,
  Briefcase,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { UserForm } from "@/components/team/user-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore, usePermissions } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { getExecutiveRanking } from "@/lib/analytics";
import { ROLE_LABEL, type User } from "@/lib/types";
import { formatCurrency, getInitials } from "@/lib/utils";
import { NoAccess } from "@/components/shared/no-access";

const roleVariant = {
  admin: "default",
  gerente: "info",
  ejecutivo: "secondary",
} as const;

export default function EquipoPage() {
  const store = useStore();
  const { users, deleteUser, countAssignments } = store;
  const { canManageTeam } = usePermissions();
  const { toast } = useToast();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<User | null>(null);
  const [deleting, setDeleting] = React.useState<User | null>(null);
  const [reassignTo, setReassignTo] = React.useState<string>("");

  const ranking = React.useMemo(() => getExecutiveRanking(store), [store]);
  const statsById = React.useMemo(
    () => Object.fromEntries(ranking.map((r) => [r.user.id, r])),
    [ranking],
  );

  const teamGoal = users.reduce((s, u) => s + u.goal, 0);
  const teamWon = ranking.reduce((s, r) => s + r.wonValue, 0);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(u: User) {
    setEditing(u);
    setFormOpen(true);
  }
  function openDelete(u: User) {
    setDeleting(u);
    setReassignTo("");
  }

  const deletingAssignments = deleting ? countAssignments(deleting.id) : 0;
  const otherUsers = users.filter((u) => u.id !== deleting?.id);
  const isLastUser = users.length <= 1;
  const needsReassign = deletingAssignments > 0;

  function confirmDelete() {
    if (!deleting) return;
    if (deleting.id === store.sessionUserId) {
      toast({
        variant: "destructive",
        title: "No puedes eliminar tu propia cuenta en sesión",
      });
      return;
    }
    if (isLastUser) {
      toast({
        variant: "destructive",
        title: "No puedes eliminar al último ejecutivo",
      });
      return;
    }
    if (needsReassign && !reassignTo) {
      toast({
        variant: "destructive",
        title: "Selecciona a quién reasignar los registros",
      });
      return;
    }
    deleteUser(deleting.id, needsReassign ? reassignTo : undefined);
    toast({
      title: "Ejecutivo eliminado",
      description: needsReassign
        ? `${deletingAssignments} registro(s) reasignados.`
        : deleting.name,
    });
    setDeleting(null);
  }

  // Guardia de permisos: solo Administrador administra el equipo.
  if (!canManageTeam) {
    return (
      <NoAccess message="La administración del equipo está reservada al rol Administrador." />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipo"
        description="Administra los ejecutivos que pueden ser asignados en el CRM"
      >
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Nuevo ejecutivo
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Ejecutivos"
          value={String(users.length)}
          icon={UsersRound}
          accent="primary"
        />
        <StatCard
          title="Meta del equipo"
          value={formatCurrency(teamGoal)}
          icon={Target}
          accent="violet"
        />
        <StatCard
          title="Ventas del equipo"
          value={formatCurrency(teamWon)}
          icon={Briefcase}
          accent="success"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u) => {
          const stats = statsById[u.id];
          const assigned = countAssignments(u.id);
          const attainment = stats?.attainment ?? 0;
          return (
            <Card key={u.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={u.avatar} alt={u.name} />
                      <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{u.name}</p>
                      <Badge variant={roleVariant[u.role]} className="mt-0.5">
                        {ROLE_LABEL[u.role]}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(u)}>
                        <Pencil className="h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => openDelete(u)}
                      >
                        <Trash2 className="h-4 w-4" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="mt-3 flex items-center gap-2 truncate text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" /> {u.email}
                </p>

                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Cumplimiento de meta
                    </span>
                    <span className="font-medium">{attainment.toFixed(0)}%</span>
                  </div>
                  <Progress
                    value={Math.min(100, attainment)}
                    indicatorClassName={
                      attainment >= 100 ? "bg-success" : "bg-primary"
                    }
                  />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3 text-center">
                  <Stat label="Ventas" value={formatCurrency(stats?.wonValue ?? 0)} />
                  <Stat label="Negocios" value={String(stats?.deals ?? 0)} />
                  <Stat label="Asignados" value={String(assigned)} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <UserForm open={formOpen} onOpenChange={setFormOpen} user={editing} />

      {/* Confirmación de borrado */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Eliminar ejecutivo
            </DialogTitle>
            <DialogDescription>
              {deleting && (
                <>
                  Vas a eliminar a <strong>{deleting.name}</strong>.
                  {needsReassign
                    ? ` Tiene ${deletingAssignments} registro(s) asignados que deben reasignarse a otro ejecutivo.`
                    : " No tiene registros asignados."}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {isLastUser ? (
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              Debe existir al menos un ejecutivo. Agrega otro antes de eliminar
              este.
            </p>
          ) : (
            needsReassign && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Reasignar registros a
                </label>
                <Select value={reassignTo} onValueChange={setReassignTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un ejecutivo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {otherUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isLastUser}
            >
              <Trash2 className="h-4 w-4" /> Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="truncate text-sm font-semibold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
