// ============================================================
// FlowCRM — Permisos por rol (RBAC)
// ============================================================
import type { Role } from "./types";

export type Permission =
  | "manage_team" // administrar ejecutivos (módulo Equipo)
  | "delete_record" // eliminar prospectos/clientes/oportunidades/etc.
  | "reassign_owner"; // cambiar el "Ejecutivo asignado" de un registro

const MATRIX: Record<Role, Permission[]> = {
  admin: ["manage_team", "delete_record", "reassign_owner"],
  gerente: ["delete_record", "reassign_owner"],
  ejecutivo: [],
};

export function can(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return MATRIX[role].includes(permission);
}
