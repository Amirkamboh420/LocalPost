"use client";

import { useState } from "react";
import { useApp } from "@/store/app-store";
import { Logo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Users,
  BarChart3,
  FolderOpen,
  Bell,
  Settings,
  CreditCard,
  CheckSquare,
  LogOut,
  X,
  Plus,
  Rocket,
  Upload,
  GitCompare,
  Lightbulb,
  Eye,
  Radio,
  FileText,
  Image as ImageIcon2,
  Shield,
  LifeBuoy,
  Info,
  Mail,
  ChevronRight,
} from "lucide-react";
import type { ViewKey } from "@/lib/types";
import { canAccessAdmin } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const NAV: { key: ViewKey; label: string; icon: any; group: string; adminOnly?: boolean }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Main" },
  { key: "calendar", label: "Calendar", icon: Calendar, group: "Main" },
  { key: "approvals", label: "Approvals", icon: CheckSquare, group: "Main" },
  { key: "analytics", label: "Analytics", icon: BarChart3, group: "Main" },
  { key: "compare", label: "A/B Compare", icon: GitCompare, group: "Main" },
  { key: "content-ideas", label: "Content Ideas", icon: Lightbulb, group: "Main" },
  { key: "competitors", label: "Competitors", icon: Eye, group: "Main" },
  { key: "queue", label: "Publish Queue", icon: Radio, group: "Main" },
  { key: "report", label: "Weekly Report", icon: FileText, group: "Main" },
  { key: "accounts", label: "Connected Accounts", icon: Users, group: "Manage" },
  { key: "content-library", label: "Content Library", icon: FolderOpen, group: "Manage" },
  { key: "media", label: "Media Library", icon: ImageIcon2, group: "Manage" },
  { key: "templates", label: "Templates", icon: Sparkles, group: "Manage" },
  { key: "bulk-upload", label: "Bulk Upload", icon: Upload, group: "Manage" },
  { key: "team", label: "Team", icon: Users, group: "Manage", adminOnly: true },
  { key: "notifications", label: "Notifications", icon: Bell, group: "Manage" },
  { key: "billing", label: "Billing", icon: CreditCard, group: "Settings", adminOnly: true },
  { key: "settings", label: "Settings", icon: Settings, group: "Settings" },
  { key: "admin-dashboard", label: "Admin Dashboard", icon: Shield, group: "Admin", adminOnly: true },
  { key: "user-management", label: "User Management", icon: Users, group: "Admin", adminOnly: true },
  { key: "support", label: "Support", icon: LifeBuoy, group: "Help" },
  { key: "about", label: "About Us", icon: Info, group: "Help" },
  { key: "contact", label: "Contact", icon: Mail, group: "Help" },
];

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const view = useApp((s) => s.view);
  const setView = useApp((s) => s.setView);
  const user = useApp((s) => s.user);
  const openComposer = useApp((s) => s.openComposer);
  const mobileNavOpen = useApp((s) => s.mobileNavOpen);
  const setMobileNavOpen = useApp((s) => s.setMobileNavOpen);
  const notifications = useApp((s) => s.notifications);

  const unread = notifications.filter((n) => !n.read).length;
  const isAdmin = canAccessAdmin(user?.role);
  const groups = isAdmin ? ["Main", "Manage", "Settings", "Admin", "Help"] : ["Main", "Manage", "Help"];

  const visibleNav = NAV.filter((n) => {
    if (n.adminOnly && !isAdmin) return false;
    return true;
  });

  const content = (
    <div className="flex h-full flex-col bg-[#14213d] text-white">
      <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
        <Logo variant="light" />
        <button
          className="lg:hidden p-1 text-white/70 hover:text-white"
          onClick={() => setMobileNavOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {isAdmin && (
        <div className="p-3">
          <Button
            onClick={() => {
              openComposer();
              setMobileNavOpen(false);
            }}
            className="w-full gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand"
          >
            <Plus className="h-4 w-4" />
            Naya Post
          </Button>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto scroll-area-brand px-3 pb-4">
        {groups.map((g) => (
          <div key={g} className="mb-2">
            <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-bold text-white/40">
              {g}
            </div>
            {NAV.filter((n) => n.group === g && (!n.adminOnly || isAdmin)).map((item) => {
              const active = view === item.key;
              const showBadge = item.key === "notifications" && unread > 0;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setView(item.key);
                    setMobileNavOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5",
                    active
                      ? "bg-saffron text-[#14213d]"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {showBadge && (
                    <span className="grid place-items-center min-w-5 h-5 px-1.5 rounded-full bg-[#14213d] text-saffron text-[10px] font-bold">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Upgrade card */}
      {user?.plan === "free" && (
        <div className="mx-3 mb-3 rounded-xl bg-gradient-to-br from-saffron/20 to-transparent border border-saffron/30 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Rocket className="h-4 w-4 text-saffron" />
            <span className="text-sm font-bold text-white">Upgrade to Pro</span>
          </div>
          <p className="text-xs text-white/60 mb-3">
            AI captions, 5 accounts, unlimited posts. Sirf Rs. 1490/month.
          </p>
          <Button
            size="sm"
            className="w-full gradient-saffron text-[#14213d] font-semibold hover:opacity-90"
            onClick={() => {
              setView("billing");
              setMobileNavOpen(false);
            }}
          >
            Upgrade karein
          </Button>
        </div>
      )}

      {/* User card */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-9 w-9 border-2 border-saffron/40">
            <AvatarImage src={user?.avatar || undefined} alt={user?.name || ""} />
            <AvatarFallback className="bg-saffron text-[#14213d] text-sm font-bold">
              {(user?.name || user?.email || "U").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">
              {user?.name || user?.businessName || "User"}
            </div>
            <div className="text-xs text-white/50 truncate">{user?.email}</div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 px-2">
          <Badge
            variant="secondary"
            className="bg-white/10 text-white capitalize border-0"
          >
            {user?.plan} · {user?.role}
          </Badge>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
        {/* demo role switcher */}
        <RoleSwitcher />
      </div>
    </div>
  );

  return (
    <>
      {/* desktop */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">
        {content}
      </aside>
      {/* mobile drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

function RoleSwitcher() {
  const user = useApp((s) => s.user);
  const setUser = useApp((s) => s.setUser);
  const setView = useApp((s) => s.setView);
  const [open, setOpen] = useState(false);
  if (!user) return null;
  const roles: { v: string; l: string }[] = [
    { v: "owner", l: "Owner" },
    { v: "admin", l: "Admin" },
    { v: "editor", l: "Editor" },
    { v: "viewer", l: "Viewer" },
  ];
  return (
    <div className="px-2 mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-[10px] text-white/40 hover:text-white/70 transition-colors py-1"
      >
        <span>🔄 Switch role (demo)</span>
        <ChevronRight className={cn("h-3 w-3 transition-transform", open && "rotate-90")} />
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-1 mt-1">
          {roles.map((r) => (
            <button
              key={r.v}
              onClick={async () => {
                await fetch("/api/profile", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ role: r.v }),
                }).then((res) => res.json()).then((d) => { if (!d.error) setUser(d); });
                setOpen(false);
                setView("dashboard");
              }}
              className={cn(
                "text-[10px] px-2 py-1 rounded-md transition-colors",
                user.role === r.v ? "bg-saffron text-[#14213d] font-semibold" : "bg-white/5 text-white/60 hover:bg-white/10"
              )}
            >
              {r.l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
