"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/store/app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  CheckCircle2,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Clock,
  Heart,
  MessageCircle,
  Eye,
  Plus,
  Zap,
  Rocket,
  Share2,
} from "lucide-react";
import { PlatformBadge, StatusBadge, PostThumb, MiniStat, EmptyState } from "@/components/app/shared";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AnalyticsSummary {
  summary: {
    totalPosts: number;
    totalReach: number;
    totalLikes: number;
    totalComments: number;
    totalFollowers: number;
    engagementRate: number;
    accountsConnected: number;
  };
  timeseries: { date: string; reach: number; engagement: number; posts: number }[];
}

export function DashboardView() {
  const user = useApp((s) => s.user);
  const posts = useApp((s) => s.posts);
  const accounts = useApp((s) => s.accounts);
  const openComposer = useApp((s) => s.openComposer);
  const setView = useApp((s) => s.setView);
  const canCreate = user?.role === "owner" || user?.role === "admin" || user?.role === "editor";
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAnalytics(d))
      .catch(() => {})
      .finally(() => setAnalyticsLoading(false));
  }, []);

  const scheduled = posts.filter((p) => p.status === "scheduled");
  const published = posts.filter((p) => p.status === "published");
  const failed = posts.filter((p) => p.status === "failed");
  const drafts = posts.filter((p) => p.status === "draft");

  const upcoming = [...scheduled]
    .filter((p) => p.scheduledAt && new Date(p.scheduledAt) >= new Date())
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
    .slice(0, 5);

  const recent = [...published]
    .sort((a, b) => new Date(b.publishedAt || b.updatedAt).getTime() - new Date(a.publishedAt || a.updatedAt).getTime())
    .slice(0, 4);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Subah bakhair" : hour < 17 ? "Assalam o alaikum" : "Sham bakhair";

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl gradient-navy p-6 sm:p-8 text-white">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-saffron/30 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-sm text-white/60">
              {new Date().toLocaleDateString("en-PK", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold">
              {greeting}, {user?.name?.split(" ")[0] || user?.businessName || "User"}! 👋
            </h2>
            <p className="mt-2 text-white/70 text-sm max-w-lg">
              Aap ke paas{" "}
              <span className="text-saffron font-semibold">{scheduled.length} scheduled</span> aur{" "}
              <span className="text-saffron font-semibold">{failed.length} failed</span> posts hain.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {canCreate && (
              <Button
                onClick={() => openComposer()}
                className="gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand"
              >
                <Plus className="h-4 w-4" />
                Naya Post
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setView("calendar")}
              className="border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent"
            >
              <Calendar className="h-4 w-4" />
              Calendar dekhein
            </Button>
          </div>
        </div>
      </div>

      {/* Onboarding checklist (only if not complete) */}
      {posts.length < 3 && (
        <OnboardingChecklist
          accountsCount={accounts.length}
          postsCount={posts.length}
          scheduledCount={scheduled.length}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsLoading && !analytics ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </>
        ) : (
          <>
            <MiniStat
              label="Scheduled"
              value={scheduled.length}
              delta={`${upcoming.length} aane wale`}
              icon={Calendar}
            />
            <MiniStat
              label="Published"
              value={analytics?.summary.totalPosts ?? published.length}
              delta="All time"
              icon={CheckCircle2}
            />
            <MiniStat
              label="Total Reach"
              value={formatNumber(analytics?.summary.totalReach ?? 0)}
              delta={`${analytics?.summary.engagementRate ?? 0}% engagement`}
              icon={Eye}
            />
            <MiniStat
              label="Followers"
              value={formatNumber(analytics?.summary.totalFollowers ?? 0)}
              delta={`${accounts.length} accounts`}
              icon={Users}
            />
          </>
        )}
      </div>

      {/* Failed posts alert */}
      {failed.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <div className="grid place-items-center h-10 w-10 rounded-lg bg-red-100 shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-red-900">
              {failed.length} post{failed.length > 1 ? "s" : ""} publish nahi ho sake
            </h3>
            <p className="text-sm text-red-700 mt-0.5">
              API timeout ki wajah se fail hue. Retry karein ya reschedule karein.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
              onClick={() => setView("calendar")}
            >
              Fix karein <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming posts */}
        <Card className="lg:col-span-2 border-[#e5e5e5]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-saffron" />
              Aane wale posts
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setView("calendar")} className="text-saffron hover:bg-[#fff5e6]">
              Sab dekhein
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {upcoming.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Koi scheduled post nahi"
                desc="Naya post banayein ya calendar mein schedule karein."
                action={
                  <Button onClick={() => openComposer()} className="gradient-saffron text-[#14213d] font-semibold">
                    <Plus className="h-4 w-4" /> Post schedule karein
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2.5">
                {upcoming.map((p) => (
                  <UpcomingRow key={p.id} post={p} onClick={() => useApp.getState().setView("calendar")} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI suggestion / quick actions */}
        <Card className="border-[#e5e5e5] bg-gradient-to-br from-[#fffdf8] to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-saffron" />
              Best time to post
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="rounded-xl bg-white border border-[#e5e5e5] p-4">
              <div className="text-xs text-[#6b6b73] mb-1">Aap ke followers sab se active hote hain:</div>
              <div className="text-2xl font-extrabold text-[#14213d]">7:00 PM</div>
              <div className="text-xs text-[#6b6b73]">Wednesdays & Fridays</div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[20, 45, 30, 80, 60, 95, 50].map((h, i) => (
                    <div key={i} className="flex-1 h-8 rounded-sm bg-saffron/20 relative overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 right-0 gradient-saffron"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-[#6b6b73] mt-1">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
            <Button
              onClick={() => openComposer()}
              className="w-full gradient-saffron text-[#14213d] font-semibold hover:opacity-90"
            >
              <Zap className="h-4 w-4" />
              Abhi post banayein
            </Button>
            {drafts.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setView("calendar")}
                className="w-full border-[#e5e5e5] text-[#14213d] hover:bg-[#fafafa]"
              >
                {drafts.length} draft{drafts.length > 1 ? "s" : ""} complete karein
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engagement insights summary */}
      {analytics && analytics.summary.totalPosts > 0 && (
        <EngagementInsights
          totalReach={analytics.summary.totalReach}
          totalLikes={analytics.summary.totalLikes}
          totalComments={analytics.summary.totalComments}
          totalShares={analytics.summary.totalShares}
          engagementRate={analytics.summary.engagementRate}
          platformBreakdown={analytics.platformBreakdown}
        />
      )}

      {/* Recent published + accounts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-[#e5e5e5]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-saffron" />
              Recent published posts
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setView("analytics")} className="text-saffron hover:bg-[#fff5e6]">
              Analytics
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {recent.length === 0 ? (
              <EmptyState icon={TrendingUp} title="Abhi tak koi post published nahi" desc="Posts publish karne ke baad yahan performance dikhegi." />
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {recent.map((p) => (
                  <RecentPostCard key={p.id} post={p} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#e5e5e5]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-saffron" />
              Connected accounts
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setView("accounts")} className="text-saffron hover:bg-[#fff5e6]">
              Manage
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {accounts.length === 0 ? (
              <EmptyState icon={Users} title="Koi account connected nahi" desc="Instagram ya Facebook connect karein." />
            ) : (
              <div className="space-y-2">
                {accounts.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#fafafa] transition-colors">
                    <Avatar className="h-9 w-9 border border-[#e5e5e5]">
                      <AvatarFallback className="bg-[#fff5e6] text-[#14213d] text-xs font-bold capitalize">
                        {a.platform.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#14213d] truncate">{a.handle}</div>
                      <div className="text-xs text-[#6b6b73]">{formatNumber(a.followers)} followers</div>
                    </div>
                    <PlatformBadge platform={a.platform} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UpcomingRow({ post, onClick }: { post: Post; onClick: () => void }) {
  const date = post.scheduledAt ? new Date(post.scheduledAt) : null;
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#fafafa] border border-transparent hover:border-[#e5e5e5] transition-all text-left"
    >
      <PostThumb post={post} className="h-12 w-12 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {post.account && <PlatformBadge platform={post.account.platform} />}
          <StatusBadge status={post.status} />
        </div>
        <div className="text-sm font-medium text-[#14213d] truncate">{post.caption}</div>
      </div>
      <div className="text-right shrink-0">
        {date && (
          <>
            <div className="text-xs font-bold text-[#14213d]">
              {date.toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
            </div>
            <div className="text-[11px] text-[#6b6b73]">
              {date.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </>
        )}
      </div>
    </button>
  );
}

function RecentPostCard({ post }: { post: Post }) {
  const m = post.metrics;
  const openDetail = useApp((s) => s.openDetail);
  return (
    <button
      onClick={() => openDetail(post.id)}
      className="text-left rounded-xl border border-[#e5e5e5] overflow-hidden hover:shadow-navy hover:-translate-y-0.5 transition-all w-full"
    >
      <PostThumb post={post} className="h-32 w-full rounded-none" />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1.5">
          {post.account && <PlatformBadge platform={post.account.platform} />}
        </div>
        <p className="text-xs text-[#14213d] line-clamp-2 leading-relaxed">{post.caption}</p>
        {m && (
          <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
            <MetricChip icon={Heart} value={m.likes} />
            <MetricChip icon={MessageCircle} value={m.comments} />
            <MetricChip icon={Eye} value={formatNumber(m.reach)} />
          </div>
        )}
      </div>
    </button>
  );
}

function MetricChip({ icon: Icon, value }: { icon: any; value: number | string }) {
  return (
    <div className="flex items-center justify-center gap-1 rounded-md bg-[#fafafa] py-1">
      <Icon className="h-3 w-3 text-[#6b6b73]" />
      <span className="text-xs font-semibold text-[#14213d]">{value}</span>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function SkeletonStat() {
  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="h-3 w-16 rounded bg-[#f4f4f5] shimmer" />
        <div className="h-7 w-7 rounded-lg bg-[#f4f4f5] shimmer" />
      </div>
      <div className="mt-2 h-7 w-20 rounded bg-[#f4f4f5] shimmer" />
      <div className="mt-1 h-3 w-24 rounded bg-[#f4f4f5] shimmer" />
    </div>
  );
}

function OnboardingChecklist({
  accountsCount,
  postsCount,
  scheduledCount,
}: {
  accountsCount: number;
  postsCount: number;
  scheduledCount: number;
}) {
  const setView = useApp((s) => s.setView);
  const openComposer = useApp((s) => s.openComposer);
  const [dismissed, setDismissed] = useState(false);

  const steps = [
    { done: accountsCount > 0, label: "Social account connect karein", action: () => setView("accounts") },
    { done: postsCount > 0, label: "Pehla post banayein (AI caption try karein)", action: () => openComposer() },
    { done: scheduledCount > 0, label: "Ek post schedule karein", action: () => openComposer() },
  ];
  const completed = steps.filter((s) => s.done).length;
  const progress = Math.round((completed / steps.length) * 100);

  if (dismissed || completed === steps.length) return null;

  return (
    <div className="rounded-2xl border border-saffron/30 bg-[#fffdf8] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-saffron" />
          <h3 className="font-bold text-[#14213d]">LocalPost setup checklist</h3>
          <Badge className="bg-saffron/15 text-[#b07300] border-0">{completed}/{steps.length}</Badge>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-[#6b6b73] hover:text-[#14213d] text-xs"
        >
          Dismiss
        </button>
      </div>
      {/* progress bar */}
      <div className="h-1.5 rounded-full bg-[#f4f4f5] overflow-hidden mb-4">
        <div
          className="h-full gradient-saffron transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={s.action}
            className={cn(
              "flex items-start gap-2.5 p-3 rounded-lg border text-left transition-colors",
              s.done
                ? "border-emerald-200 bg-emerald-50"
                : "border-[#e5e5e5] bg-white hover:border-saffron hover:bg-[#fff5e6]"
            )}
          >
            <span className={cn(
              "grid place-items-center h-5 w-5 rounded-full shrink-0 mt-0.5",
              s.done ? "bg-emerald-500 text-white" : "border-2 border-[#e5e5e5]"
            )}>
              {s.done && <CheckCircle2 className="h-3.5 w-3.5" />}
            </span>
            <span className={cn(
              "text-xs font-medium",
              s.done ? "text-emerald-700 line-through" : "text-[#14213d]"
            )}>
              {s.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EngagementInsights({
  totalReach,
  totalLikes,
  totalComments,
  totalShares,
  engagementRate,
  platformBreakdown,
}: {
  totalReach: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  engagementRate: number;
  platformBreakdown: { platform: string; handle: string; followers: number; posts: number; reach: number; likes: number }[];
}) {
  const totalEng = totalLikes + totalComments + totalShares;
  // compute share percentages for the donut
  const likesPct = totalEng > 0 ? (totalLikes / totalEng) * 100 : 0;
  const commentsPct = totalEng > 0 ? (totalComments / totalEng) * 100 : 0;
  const sharesPct = totalEng > 0 ? (totalShares / totalEng) * 100 : 0;

  const segments = [
    { label: "Likes", value: totalLikes, pct: likesPct, color: "#e5484d", icon: Heart },
    { label: "Comments", value: totalComments, pct: commentsPct, color: "#1877f2", icon: MessageCircle },
    { label: "Shares", value: totalShares, pct: sharesPct, color: "#10b981", icon: Share2 },
  ];

  // top platform by reach
  const topPlatform = [...platformBreakdown].sort((a, b) => b.reach - a.reach)[0];

  return (
    <Card className="border-[#e5e5e5]">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-saffron" />
          Engagement insights
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => useApp.getState().setView("analytics")} className="text-saffron hover:bg-[#fff5e6]">
          Full analytics
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          {/* engagement breakdown */}
          <div>
            <div className="text-xs text-[#6b6b73] mb-3">Engagement breakdown</div>
            <div className="space-y-2.5">
              {segments.map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="grid place-items-center h-8 w-8 rounded-lg shrink-0" style={{ backgroundColor: s.color + "20" }}>
                    <s.icon className="h-4 w-4" style={{ color: s.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[#14213d]">{s.label}</span>
                      <span className="text-xs font-bold text-[#14213d]">{formatNumber(s.value)} · {Math.round(s.pct)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#f4f4f5] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* summary stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#e5e5e5] p-3 text-center">
              <div className="text-2xl font-extrabold text-saffron">{formatNumber(totalReach)}</div>
              <div className="text-[10px] uppercase tracking-wide text-[#6b6b73] mt-0.5">Total Reach</div>
            </div>
            <div className="rounded-xl border border-[#e5e5e5] p-3 text-center">
              <div className="text-2xl font-extrabold text-emerald-600">{engagementRate}%</div>
              <div className="text-[10px] uppercase tracking-wide text-[#6b6b73] mt-0.5">Engagement rate</div>
            </div>
            {topPlatform && (
              <div className="col-span-2 rounded-xl border border-saffron/30 bg-[#fff5e6] p-3">
                <div className="text-[10px] uppercase tracking-wide text-[#6b6b73] mb-1">Top performing platform</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#14213d] capitalize">{topPlatform.platform} · @{topPlatform.handle}</span>
                  <span className="text-sm font-bold text-saffron">{formatNumber(topPlatform.reach)} reach</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
