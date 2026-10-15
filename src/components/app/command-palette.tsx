"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useApp } from "@/store/app-store";
import type { ViewKey } from "@/lib/types";
import {
  Search,
  Command,
  Plus,
  LayoutDashboard,
  Calendar,
  Radio,
  FileText,
  BarChart3,
  GitCompare,
  Lightbulb,
  Eye,
  Users,
  FolderOpen,
  Image as ImageIcon,
  Sparkles,
  Upload,
  CheckSquare,
  Bell,
  Settings,
  CreditCard,
  Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  icon: any;
  group: "Navigation" | "Actions" | "Help";
  action: () => void;
  keywords?: string;
}

export function CommandPalette() {
  const open = useApp((s) => s.commandPaletteOpen);
  const setOpen = useApp((s) => s.setCommandPaletteOpen);
  const setView = useApp((s) => s.setView);
  const openComposer = useApp((s) => s.openComposer);
  const setShortcutsOpen = useApp((s) => s.setShortcutsOpen);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!useApp.getState().commandPaletteOpen);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setOpen]);

  const navItems: { key: ViewKey; label: string; icon: any }[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "calendar", label: "Calendar", icon: Calendar },
    { key: "queue", label: "Publish Queue", icon: Radio },
    { key: "report", label: "Weekly Report", icon: FileText },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "compare", label: "A/B Compare", icon: GitCompare },
    { key: "content-ideas", label: "Content Ideas", icon: Lightbulb },
    { key: "competitors", label: "Competitors", icon: Eye },
    { key: "accounts", label: "Connected Accounts", icon: Users },
    { key: "content-library", label: "Content Library", icon: FolderOpen },
    { key: "media", label: "Media Library", icon: ImageIcon },
    { key: "templates", label: "Templates", icon: Sparkles },
    { key: "bulk-upload", label: "Bulk Upload", icon: Upload },
    { key: "approvals", label: "Approvals", icon: CheckSquare },
    { key: "team", label: "Team", icon: Users },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "settings", label: "Settings", icon: Settings },
    { key: "billing", label: "Billing", icon: CreditCard },
  ];

  const items: CommandItem[] = [
    {
      id: "new-post",
      label: "Create new post",
      hint: "N",
      icon: Plus,
      group: "Actions",
      action: () => { openComposer(); setOpen(false); },
      keywords: "compose create new post naya",
    },
    ...navItems.map((n) => ({
      id: n.key,
      label: n.label,
      icon: n.icon,
      group: "Navigation" as const,
      action: () => { setView(n.key); setOpen(false); },
      keywords: n.key,
    })),
    {
      id: "shortcuts",
      label: "Keyboard shortcuts",
      hint: "?",
      icon: Keyboard,
      group: "Help",
      action: () => { setShortcutsOpen(true); setOpen(false); },
      keywords: "help keyboard shortcuts keys",
    },
  ];

  const filtered = query
    ? items.filter((i) =>
        i.label.toLowerCase().includes(query.toLowerCase()) ||
        i.keywords?.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  const groups = ["Actions", "Navigation", "Help"] as const;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Command palette</DialogTitle>
          <DialogDescription>Quick navigation aur actions</DialogDescription>
        </DialogHeader>
        {/* search input */}
        <div className="flex items-center gap-2.5 px-4 h-13 border-b border-[#e5e5e5] py-3">
          <Search className="h-4 w-4 text-[#6b6b73] shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ya command likhein…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#6b6b73]"
          />
          <kbd className="text-[10px] text-[#6b6b73] bg-[#f4f4f5] px-1.5 py-0.5 rounded">ESC</kbd>
        </div>
        {/* results */}
        <div className="max-h-80 overflow-y-auto scroll-area-brand py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#6b6b73]">
              Koi result nahi mila "{query}"
            </div>
          ) : (
            groups.map((g) => {
              const groupItems = filtered.filter((i) => i.group === g);
              if (groupItems.length === 0) return null;
              return (
                <div key={g} className="mb-1">
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-[#6b6b73]/60">
                    {g}
                  </div>
                  {groupItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#fff5e6] transition-colors text-left group"
                    >
                      <div className="grid place-items-center h-7 w-7 rounded-lg bg-[#f4f4f5] group-hover:bg-saffron/20 text-[#6b6b73] group-hover:text-saffron transition-colors">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-[#14213d] flex-1">{item.label}</span>
                      {item.hint && (
                        <kbd className="text-[10px] text-[#6b6b73] bg-white border border-[#e5e5e5] px-1.5 py-0.5 rounded">
                          {item.hint}
                        </kbd>
                      )}
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
        {/* footer */}
        <div className="border-t border-[#e5e5e5] px-3 py-2 flex items-center justify-between text-[10px] text-[#6b6b73]">
          <div className="flex items-center gap-1.5">
            <Command className="h-3 w-3" />
            <span>LocalPost command palette</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <kbd className="bg-[#f4f4f5] px-1 py-0.5 rounded">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-[#f4f4f5] px-1 py-0.5 rounded">↵</kbd> select
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ShortcutsOverlay() {
  const open = useApp((s) => s.shortcutsOpen);
  const setOpen = useApp((s) => s.setShortcutsOpen);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.shiftKey && e.key === "?" && !(e.target as HTMLElement)?.matches("input, textarea")) {
        e.preventDefault();
        setOpen(!useApp.getState().shortcutsOpen);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setOpen]);

  const shortcuts = [
    { keys: "⌘ K", desc: "Command palette open karein" },
    { keys: "N", desc: "Naya post banayein" },
    { keys: "?", desc: "Yeh shortcuts overlay" },
    { keys: "ESC", desc: "Dialogs close karein" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-saffron" /> Keyboard shortcuts
          </DialogTitle>
          <DialogDescription>
            LocalPost ko fast chalane ke liye shortcuts.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-3">
          {shortcuts.map((s) => (
            <div key={s.keys} className="flex items-center justify-between py-2 border-b border-[#e5e5e5] last:border-0">
              <span className="text-sm text-[#14213d]">{s.desc}</span>
              <kbd className="text-xs font-mono bg-[#f4f4f5] border border-[#e5e5e5] px-2 py-1 rounded text-[#14213d]">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[#6b6b73] mt-2 text-center">
          Tip: Cmd+K se command palette khol kar kisi bhi view mein jump karein.
        </p>
      </DialogContent>
    </Dialog>
  );
}
