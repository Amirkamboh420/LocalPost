import type { UserRole, ViewKey } from "@/lib/types";

// Role permission system for LocalPost
// owner  — full access (workspace creator) — implicit admin + billing + admin panel
// admin  — full app access incl. team, billing, admin panel (no owner transfer)
// editor — create/edit posts, calendar, analytics, content (no team/billing/admin)
// viewer — read-only: view dashboard, calendar, analytics (no create/edit)

export function canEdit(role: UserRole | undefined): boolean {
  if (!role) return false;
  return role === "owner" || role === "admin" || role === "editor";
}

export function canCreate(role: UserRole | undefined): boolean {
  return canEdit(role);
}

export function canDelete(role: UserRole | undefined): boolean {
  if (!role) return false;
  return role === "owner" || role === "admin";
}

export function canManageTeam(role: UserRole | undefined): boolean {
  if (!role) return false;
  return role === "owner" || role === "admin";
}

export function canManageBilling(role: UserRole | undefined): boolean {
  if (!role) return false;
  return role === "owner" || role === "admin";
}

export function canApprove(role: UserRole | undefined): boolean {
  if (!role) return false;
  return role === "owner" || role === "admin";
}

export function canAccessAdmin(role: UserRole | undefined): boolean {
  if (!role) return false;
  return role === "owner" || role === "admin";
}

export function canAccessView(view: ViewKey, role: UserRole | undefined): boolean {
  if (!role) return false;

  // Admin-only views
  const adminOnly: ViewKey[] = ["admin-dashboard", "user-management", "team", "billing"];
  if (adminOnly.includes(view)) {
    return canManageTeam(role);
  }

  // Editors can access everything else
  return true;
}

// Views hidden entirely for viewers (they can see data but not act)
export function isViewReadOnly(view: ViewKey, role: UserRole | undefined): boolean {
  if (!role) return false;
  if (role !== "viewer") return false;
  const actionViews: ViewKey[] = ["composer", "bulk-upload", "approvals"];
  return actionViews.includes(view);
}

export const ROLE_META: Record<UserRole, { label: string; desc: string; color: string; icon: string }> = {
  owner: { label: "Owner", desc: "Workspace owner — full access incl. billing & admin", color: "#fca311" },
  admin: { label: "Admin", desc: "Full access — manage team, billing, admin panel", color: "#e5484d" },
  editor: { label: "Editor", desc: "Create & edit posts, schedule, analytics", color: "#1877f2" },
  viewer: { label: "Viewer", desc: "Read-only — view dashboard, calendar, analytics", color: "#6b6b73" },
};
