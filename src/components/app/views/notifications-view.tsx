"use client";

import { useEffect } from "react";
import { useApp } from "@/store/app-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  Bell,
  Rocket,
  Clock,
  Mail,
  Check,
  Inbox,
} from "lucide-react";
import { EmptyState } from "@/components/app/shared";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/lib/types";

const ICONS: Record<AppNotification["type"], any> = {
  post_published: CheckCircle2,
  post_failed: AlertTriangle,
  reminder: Clock,
  system: Bell,
  welcome: Rocket,
};

const COLORS: Record<AppNotification["type"], string> = {
  post_published: "text-emerald-600 bg-emerald-50",
  post_failed: "text-red-600 bg-red-50",
  reminder: "text-saffron bg-[#fff5e6]",
  system: "text-[#14213d] bg-[#f4f4f5]",
  welcome: "text-saffron bg-[#fff5e6]",
};

export function NotificationsView() {
  const notifications = useApp((s) => s.notifications);
  const setNotifications = useApp((s) => s.setNotifications);
  const markNotificationsRead = useApp((s) => s.markNotificationsRead);

  useEffect(() => {
    // mark read on view
    if (notifications.some((n) => !n.read)) {
      fetch("/api/notifications", { method: "PATCH" })
        .then((r) => r.json())
        .then((d) => {
          setNotifications(d.notifications);
          markNotificationsRead();
        })
        .catch(() => {});
    }
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#14213d]">Notifications</h2>
          <p className="text-sm text-[#6b6b73]">
            {unread > 0 ? `${unread} padhe jaane ke liye` : "Sab notifications parh chuke hain"}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" onClick={markNotificationsRead} className="border-[#e5e5e5] text-[#14213d]">
            <Check className="h-4 w-4" /> Sab read karein
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="border-dashed border-[#e5e5e5]">
          <EmptyState
            icon={Inbox}
            title="Koi notification nahi"
            desc="Jab aap posts schedule ya publish karenge tab yahan updates aayenge."
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] || Bell;
            const colorCls = COLORS[n.type] || COLORS.system;
            return (
              <Card
                key={n.id}
                className={cn(
                  "border-[#e5e5e5] p-4 flex items-start gap-3 hover:shadow-navy transition-shadow",
                  !n.read && "border-l-4 border-l-saffron bg-[#fffdf8]"
                )}
              >
                <div className={cn("grid place-items-center h-10 w-10 rounded-xl shrink-0", colorCls)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#14213d] text-sm">{n.title}</h3>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-saffron animate-pulse" />
                    )}
                  </div>
                  <p className="text-sm text-[#6b6b73] mt-0.5 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#6b6b73]">
                    <Clock className="h-3 w-3" />
                    {timeAgo(n.createdAt)}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* email pref banner */}
      <Card className="border-[#e5e5e5] p-4 bg-gradient-to-br from-[#fffdf8] to-white">
        <div className="flex items-start gap-3">
          <div className="grid place-items-center h-10 w-10 rounded-xl bg-[#14213d]">
            <Mail className="h-5 w-5 text-saffron" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#14213d]">Email notifications</h3>
            <p className="text-sm text-[#6b6b73] mt-0.5">
              Failed posts aur weekly reports email par paayein. Settings mein enable karein.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-[#e5e5e5] text-[#14213d]"
              onClick={() => useApp.getState().setView("settings")}
            >
              Email settings kholien
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Abhi";
  if (m < 60) return `${m} minute pehle`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ghante pehle`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} din pehle`;
  return new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short" });
}
