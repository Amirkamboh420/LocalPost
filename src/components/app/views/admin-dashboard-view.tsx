"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  FileText,
  Eye,
  MessageSquare,
  TrendingUp,
  Shield,
  Crown,
  Loader2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useApp } from "@/store/app-store";
import { ROLE_META } from "@/lib/permissions";
import { cn } from "@/lib/utils";

interface AdminStats {
  users: number;
  posts: number;
  accounts: number;
  tickets: number;
  publishedPosts: number;
  planBreakdown: { free: number; pro: number; agency: number };
  ticketsBreakdown: { open: number; resolved: number };
  newThisWeek: number;
}

export function AdminDashboardView() {
  const setView = useApp((s) => s.setView);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (!d.error) setStats(d); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-[#f4f4f5] shimmer" />)}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="border-dashed border-[#e5e5e5] max-w-2xl mx-auto mt-10">
        <div className="p-10 text-center">
          <AlertCircle className="h-10 w-10 mx-auto text-red-400 mb-2" />
          <p className="text-sm text-[#6b6b73]">Admin access required. Aap ke paas admin permission nahi hai.</p>
        </div>
      </Card>
    );
  }

  const planTotal = stats.planBreakdown.free + stats.planBreakdown.pro + stats.planBreakdown.agency;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">
      {/* header */}
      <div className="relative overflow-hidden rounded-2xl gradient-navy p-6 text-white">
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-saffron/30 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="grid place-items-center h-12 w-12 rounded-xl gradient-saffron text-[#14213d]">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold">Admin Dashboard</h2>
            <p className="text-sm text-white/70">Platform-wide overview — users, posts, support</p>
          </div>
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.users} delta={`+${stats.newThisWeek} this week`} color="#fca311" onClick={() => setView("user-management")} />
        <StatCard icon={FileText} label="Total Posts" value={stats.posts} delta={`${stats.publishedPosts} published`} color="#1877f2" />
        <StatCard icon={Eye} label="Connected Accounts" value={stats.accounts} color="#10b981" />
        <StatCard icon={MessageSquare} label="Support Tickets" value={stats.tickets} delta={`${stats.ticketsBreakdown.open} open`} color="#8b5cf6" onClick={() => setView("support")} />
      </div>

      {/* plan breakdown */}
      <Card className="border-[#e5e5e5]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Crown className="h-4 w-4 text-saffron" /> Plan breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "Free", count: stats.planBreakdown.free, color: "#6b6b73" },
              { label: "Pro", count: stats.planBreakdown.pro, color: "#fca311" },
              { label: "Agency", count: stats.planBreakdown.agency, color: "#14213d" },
            ].map((p) => {
              const pct = planTotal > 0 ? (p.count / planTotal) * 100 : 0;
              return (
                <div key={p.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#14213d]">{p.label}</span>
                    <span className="text-sm font-bold text-[#14213d]">{p.count} <span className="text-[#6b6b73] font-normal">({Math.round(pct)}%)</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-[#f4f4f5] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="text-xs text-[#6b6b73]">Open tickets</div>
              <div className="text-2xl font-bold text-amber-600">{stats.ticketsBreakdown.open}</div>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <div className="text-xs text-[#6b6b73]">Resolved tickets</div>
              <div className="text-2xl font-bold text-emerald-600">{stats.ticketsBreakdown.resolved}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-[#e5e5e5] p-5 hover:shadow-navy transition-shadow cursor-pointer" >
          <button onClick={() => setView("user-management")} className="text-left w-full">
            <div className="flex items-center gap-3 mb-2">
              <div className="grid place-items-center h-10 w-10 rounded-lg bg-[#14213d]">
                <Users className="h-5 w-5 text-saffron" />
              </div>
              <div>
                <h3 className="font-bold text-[#14213d]">User Management</h3>
                <p className="text-xs text-[#6b6b73]">Users dekhein, roles/plans change karein</p>
              </div>
              <ArrowRight className="h-4 w-4 text-[#6b6b73] ml-auto" />
            </div>
          </button>
        </Card>
        <Card className="border-[#e5e5e5] p-5 hover:shadow-navy transition-shadow cursor-pointer">
          <button onClick={() => setView("support")} className="text-left w-full">
            <div className="flex items-center gap-3 mb-2">
              <div className="grid place-items-center h-10 w-10 rounded-lg bg-saffron/20">
                <MessageSquare className="h-5 w-5 text-saffron" />
              </div>
              <div>
                <h3 className="font-bold text-[#14213d]">Support Tickets</h3>
                <p className="text-xs text-[#6b6b73]">Tickets resolve karein, replies bhejein</p>
              </div>
              <ArrowRight className="h-4 w-4 text-[#6b6b73] ml-auto" />
            </div>
          </button>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, delta, color, onClick }: { icon: any; label: string; value: number; delta?: string; color: string; onClick?: () => void }) {
  return (
    <Card className={cn("border-[#e5e5e5] p-4 hover:shadow-navy transition-shadow", onClick && "cursor-pointer")} >
      <button onClick={onClick} className="text-left w-full" disabled={!onClick}>
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-[#6b6b73] font-medium">{label}</span>
          <div className="grid place-items-center h-8 w-8 rounded-lg" style={{ backgroundColor: color + "20" }}>
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
        </div>
        <div className="mt-2 text-2xl font-extrabold text-[#14213d]">{value}</div>
        {delta && <div className="mt-0.5 text-xs text-emerald-600 font-medium flex items-center gap-1"><TrendingUp className="h-3 w-3" />{delta}</div>}
      </button>
    </Card>
  );
}
