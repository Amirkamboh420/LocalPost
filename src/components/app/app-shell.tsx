"use client";

import { useEffect, useCallback } from "react";
import { useApp } from "@/store/app-store";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { DashboardView } from "@/components/app/views/dashboard-view";
import { CalendarView } from "@/components/app/views/calendar-view";
import { ComposerDialog } from "@/components/app/composer-dialog";
import { AccountsView } from "@/components/app/views/accounts-view";
import { AnalyticsView } from "@/components/app/views/analytics-view";
import { ContentLibraryView } from "@/components/app/views/content-library-view";
import { TemplatesGalleryView } from "@/components/app/views/templates-gallery-view";
import { NotificationsView } from "@/components/app/views/notifications-view";
import { SettingsView } from "@/components/app/views/settings-view";
import { BillingView } from "@/components/app/views/billing-view";
import { ApprovalsView } from "@/components/app/views/approvals-view";
import { BulkUploadView } from "@/components/app/views/bulk-upload-view";
import { TeamView } from "@/components/app/views/team-view";
import { CompareView } from "@/components/app/views/compare-view";
import { ContentIdeasView } from "@/components/app/views/content-ideas-view";
import { CompetitorsView } from "@/components/app/views/competitors-view";
import { QueueView } from "@/components/app/views/queue-view";
import { ReportView } from "@/components/app/views/report-view";
import { MediaLibraryView } from "@/components/app/views/media-library-view";
import { SupportView } from "@/components/app/views/support-view";
import { AdminDashboardView } from "@/components/app/views/admin-dashboard-view";
import { UserManagementView } from "@/components/app/views/user-management-view";
import { AboutView, ContactView } from "@/components/app/views/about-contact-views";
import { PostDetailDialog } from "@/components/app/post-detail-dialog";
import { CommandPalette, ShortcutsOverlay } from "@/components/app/command-palette";
import { toast } from "sonner";
import type { Post, Account, AppNotification } from "@/lib/types";

export function AppShell() {
  const view = useApp((s) => s.view);
  const setUser = useApp((s) => s.setUser);
  const setPosts = useApp((s) => s.setPosts);
  const setAccounts = useApp((s) => s.setAccounts);
  const setNotifications = useApp((s) => s.setNotifications);

  const loadAll = useCallback(async () => {
    try {
      const [postsRes, accountsRes, notifRes] = await Promise.all([
        fetch("/api/posts", { cache: "no-store" }),
        fetch("/api/accounts", { cache: "no-store" }),
        fetch("/api/notifications", { cache: "no-store" }),
      ]);
      if (postsRes.ok) {
        const data = await postsRes.json();
        setPosts(data.posts as Post[]);
      }
      if (accountsRes.ok) {
        const data = await accountsRes.json();
        setAccounts(data.accounts as Account[]);
      }
      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(data.notifications as AppNotification[]);
      }
    } catch {
      // silent
    }
  }, [setPosts, setAccounts, setNotifications]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // keyboard shortcuts: N = new post, ? = show shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (typing) return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        useApp.getState().openComposer();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    toast.success("Aap logout ho gaye.");
  }

  return (
    <div className="min-h-screen flex bg-[#fafafa] dark:bg-[#0b1220]">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Topbar onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto scroll-area-brand">
          <div key={view} className="animate-view-in">
            {view === "dashboard" && <DashboardView />}
            {view === "calendar" && <CalendarView />}
            {view === "accounts" && <AccountsView />}
            {view === "analytics" && <AnalyticsView />}
            {view === "compare" && <CompareView />}
            {view === "content-ideas" && <ContentIdeasView />}
            {view === "competitors" && <CompetitorsView />}
            {view === "queue" && <QueueView />}
            {view === "report" && <ReportView />}
            {view === "media" && <MediaLibraryView />}
            {view === "support" && <SupportView />}
            {view === "admin-dashboard" && <AdminDashboardView />}
            {view === "user-management" && <UserManagementView />}
            {view === "about" && <AboutView />}
            {view === "contact" && <ContactView />}
            {view === "content-library" && <ContentLibraryView />}
            {view === "templates" && <TemplatesGalleryView />}
            {view === "bulk-upload" && <BulkUploadView />}
            {view === "notifications" && <NotificationsView />}
            {view === "settings" && <SettingsView />}
            {view === "billing" && <BillingView />}
            {view === "approvals" && <ApprovalsView />}
            {view === "team" && <TeamView />}
          </div>
        </main>
      </div>
      <ComposerDialog />
      <PostDetailDialog />
      <CommandPalette />
      <ShortcutsOverlay />
    </div>
  );
}
