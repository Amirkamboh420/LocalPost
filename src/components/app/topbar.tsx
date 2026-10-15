"use client";

import { useApp } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Menu,
  Plus,
  Bell,
  Search,
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon,
  CreditCard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const VIEW_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Aap ke posts aur performance ka overview" },
  calendar: { title: "Content Calendar", subtitle: "Scheduled posts ko date/time pe manage karein" },
  composer: { title: "Create Post", subtitle: "Naya post banayein ya edit karein" },
  accounts: { title: "Connected Accounts", subtitle: "Social media accounts manage karein" },
  analytics: { title: "Analytics", subtitle: "Performance aur engagement trends" },
  compare: { title: "A/B Comparison", subtitle: "Do posts side-by-side compare karein" },
  "content-ideas": { title: "Content Ideas", subtitle: "AI se post ideas generate karein" },
  competitors: { title: "Competitor Tracking", subtitle: "Apne competitors ko monitor karein" },
  queue: { title: "Publish Queue", subtitle: "Auto-publish pipeline aur upcoming posts" },
  report: { title: "Weekly Report", subtitle: "Is hafte ki performance summary" },
  media: { title: "Media Library", subtitle: "Saari images jo posts mein use ki hain" },
  support: { title: "Support", subtitle: "Help paayein ya ticket submit karein" },
  "admin-dashboard": { title: "Admin Dashboard", subtitle: "Platform-wide overview" },
  "user-management": { title: "User Management", subtitle: "Users, roles aur plans manage karein" },
  about: { title: "About Us", subtitle: "LocalPost ki story" },
  contact: { title: "Contact", subtitle: "Hum se raabta karein" },
  "content-library": { title: "Content Library", subtitle: "Reusable templates aur media" },
  templates: { title: "Post Templates", subtitle: "Ready-made captions jo convert karti hain" },
  "bulk-upload": { title: "Bulk Upload", subtitle: "CSV se multiple posts schedule karein" },
  team: { title: "Team Members", subtitle: "Apni team aur roles manage karein" },
  approvals: { title: "Approval Queue", subtitle: "Pending posts ko review aur approve karein" },
  notifications: { title: "Notifications", subtitle: "Aap ki recent activity" },
  settings: { title: "Settings", subtitle: "Profile, timezone aur preferences" },
  billing: { title: "Billing & Plans", subtitle: "Subscription aur payment manage karein" },
};

export function Topbar({ onLogout }: { onLogout: () => void }) {
  const view = useApp((s) => s.view);
  const setView = useApp((s) => s.setView);
  const user = useApp((s) => s.user);
  const setMobileNavOpen = useApp((s) => s.setMobileNavOpen);
  const openComposer = useApp((s) => s.openComposer);
  const setCommandPaletteOpen = useApp((s) => s.setCommandPaletteOpen);
  const notifications = useApp((s) => s.notifications);
  const setView2 = setView;
  const canCreate = user?.role === "owner" || user?.role === "admin" || user?.role === "editor";

  const meta = VIEW_TITLES[view] || VIEW_TITLES.dashboard;
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#e5e5e5]">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          className="lg:hidden p-2 -ml-2 text-[#14213d]"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-bold text-[#14213d] truncate">{meta.title}</h1>
          <p className="hidden sm:block text-xs text-[#6b6b73] truncate">{meta.subtitle}</p>
        </div>

        {/* command palette trigger (desktop) */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 h-9 w-56 rounded-lg border border-[#e5e5e5] bg-[#fafafa] text-sm text-[#6b6b73] hover:bg-white hover:border-saffron/40 transition-colors px-3"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search ya jump to…</span>
          <kbd className="text-[10px] bg-white border border-[#e5e5e5] px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </button>

        {canCreate && (
          <Button
            onClick={() => openComposer()}
            className="gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Post</span>
          </Button>
        )}

        {/* theme toggle */}
        <ThemeToggle />

        {/* notifications */}
        <button
          onClick={() => setView2("notifications")}
          className="relative grid place-items-center h-9 w-9 rounded-lg border border-[#e5e5e5] hover:bg-[#fafafa] text-[#14213d] transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 grid place-items-center min-w-4 h-4 px-1 rounded-full bg-saffron text-[#14213d] text-[10px] font-bold animate-pulse-ring">
              {unread}
            </span>
          )}
        </button>

        {/* user menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-saffron/50">
              <Avatar className="h-9 w-9 border-2 border-[#e5e5e5]">
                <AvatarImage src={user?.avatar || undefined} alt={user?.name || ""} />
                <AvatarFallback className="bg-[#14213d] text-saffron text-sm font-bold">
                  {(user?.name || user?.email || "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-semibold text-[#14213d]">{user?.name || "User"}</span>
                <span className="text-xs text-[#6b6b73] font-normal truncate">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setView("settings")}>
              <UserIcon className="h-4 w-4" />
              Profile & Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setView("billing")}>
              <CreditCard className="h-4 w-4" />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setView("settings")}>
              <SettingsIcon className="h-4 w-4" />
              Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-[#e5484d] focus:text-[#e5484d]">
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
