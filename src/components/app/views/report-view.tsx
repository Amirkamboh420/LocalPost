"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Trophy,
  Calendar,
  Loader2,
  FileText,
  Download,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PlatformIcon, EmptyState } from "@/components/app/shared";
import { cn } from "@/lib/utils";

interface ReportData {
  period: { start: string; end: string };
  summary: { posts: number; reach: number; likes: number; comments: number; shares: number; impressions: number; saves: number };
  deltas: { posts: number; reach: number; likes: number; comments: number; shares: number };
  top: { id: string; caption: string; platform: string; reach: number; likes: number; publishedAt: string | null }[];
  platformBreakdown: { platform: string; handle: string; posts: number; reach: number; likes: number }[];
  totalFollowers: number;
  accountsConnected: number;
}

export function ReportView() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/report", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-[#f4f4f5] shimmer" />
        ))}
      </div>
    );
  }

  if (!data || data.summary.posts === 0) {
    return (
      <Card className="border-dashed border-[#e5e5e5] max-w-3xl mx-auto mt-10">
        <EmptyState
          icon={FileText}
          title="Abhi weekly report available nahi"
          desc="Jab aap is hafte posts publish karenge tab yahan reach, engagement, aur growth trends dikhenge."
        />
      </Card>
    );
  }

  const s = data.summary;
  const d = data.deltas;
  const periodStart = new Date(data.period.start).toLocaleDateString("en-PK", { day: "numeric", month: "short" });
  const periodEnd = new Date(data.period.end).toLocaleDateString("en-PK", { day: "numeric", month: "short" });

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-5xl mx-auto">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#14213d] flex items-center gap-2">
            <FileText className="h-5 w-5 text-saffron" /> Weekly report
          </h2>
          <p className="text-sm text-[#6b6b73] mt-1 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {periodStart} – {periodEnd} · vs previous week
          </p>
        </div>
        <Button variant="outline" className="border-[#e5e5e5] text-[#14213d]" onClick={() => window.print()}>
          <Download className="h-4 w-4" /> Export PDF
        </Button>
      </div>

      {/* summary cards with deltas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportStat icon={Eye} label="Reach" value={fmt(s.reach)} delta={d.reach} color="#fca311" />
        <ReportStat icon={Heart} label="Likes" value={fmt(s.likes)} delta={d.likes} color="#e5484d" />
        <ReportStat icon={MessageCircle} label="Comments" value={fmt(s.comments)} delta={d.comments} color="#1877f2" />
        <ReportStat icon={Share2} label="Shares" value={fmt(s.shares)} delta={d.shares} color="#10b981" />
      </div>

      {/* posts + followers */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-[#e5e5e5] p-4 flex items-center gap-3">
          <div className="grid place-items-center h-10 w-10 rounded-lg bg-[#14213d]">
            <FileText className="h-5 w-5 text-saffron" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#14213d]">{s.posts}</div>
            <div className="text-xs text-[#6b6b73]">Posts this week</div>
          </div>
          <DeltaBadge delta={d.posts} className="ml-auto" />
        </Card>
        <Card className="border-[#e5e5e5] p-4 flex items-center gap-3">
          <div className="grid place-items-center h-10 w-10 rounded-lg bg-saffron/20">
            <Trophy className="h-5 w-5 text-saffron" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#14213d]">{fmt(data.totalFollowers)}</div>
            <div className="text-xs text-[#6b6b73]">Total followers · {data.accountsConnected} accounts</div>
          </div>
        </Card>
      </div>

      {/* platform breakdown chart */}
      <Card className="border-[#e5e5e5]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-saffron" /> Platform breakdown — this week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.platformBreakdown} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
              <XAxis dataKey="platform" tick={{ fontSize: 11, fill: "#6b6b73" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b6b73" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{ background: "#14213d", border: "none", borderRadius: 10, color: "white", fontSize: 12 }}
                cursor={{ fill: "#fff5e6" }}
              />
              <Bar dataKey="reach" radius={[6, 6, 0, 0]} fill="#fca311" name="Reach" />
              <Bar dataKey="likes" radius={[6, 6, 0, 0]} fill="#14213d" name="Likes" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {data.platformBreakdown.map((p) => (
              <div key={p.handle} className="flex items-center gap-2 text-xs">
                <PlatformIcon platform={p.platform as any} className="h-3.5 w-3.5 shrink-0" />
                <span className="font-medium text-[#14213d] w-32 truncate">@{p.handle}</span>
                <span className="text-[#6b6b73]">{p.posts} posts</span>
                <span className="text-[#6b6b73] ml-auto">{fmt(p.reach)} reach · {p.likes} likes</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* top posts */}
      <Card className="border-[#e5e5e5]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-saffron" /> Top posts this week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.top.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#fafafa] transition-colors">
                <span className="grid place-items-center h-7 w-7 rounded-full bg-saffron/20 text-saffron font-bold text-xs shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#14213d] line-clamp-1">{p.caption}</p>
                  <div className="text-xs text-[#6b6b73] flex items-center gap-2 mt-0.5">
                    <PlatformIcon platform={p.platform as any} className="h-3 w-3" />
                    {p.publishedAt && new Date(p.publishedAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs shrink-0">
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3 text-saffron" /> {fmt(p.reach)}</span>
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-red-500" /> {p.likes}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI takeaway */}
      <Card className="border-saffron/30 bg-[#fffdf8]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-lg bg-saffron/20 shrink-0">
              <TrendingUp className="h-5 w-5 text-saffron" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#14213d]">Weekly takeaway</h4>
              <p className="text-xs text-[#6b6b73] mt-1 leading-relaxed">
                {d.reach >= 0
                  ? `Reach ${d.reach}% barhi vs pichle hafte. Top performing content ko analyze karke next week similar topics pe post karein.`
                  : `Reach ${Math.abs(d.reach)}}% kam hui. Posting frequency ya timing review karein — best-time suggestions use karein.`}
                {" "}
                {s.posts < 5 && "Aim karein hafte mein kam az kam 5 posts for better reach."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportStat({ icon: Icon, label, value, delta, color }: { icon: any; label: string; value: string; delta: number; color: string }) {
  return (
    <Card className="border-[#e5e5e5] p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-[#6b6b73] font-medium">{label}</span>
        <div className="grid place-items-center h-8 w-8 rounded-lg" style={{ backgroundColor: color + "20" }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <div className="mt-2 text-2xl font-extrabold text-[#14213d]">{value}</div>
      <DeltaBadge delta={delta} className="mt-1" />
    </Card>
  );
}

function DeltaBadge({ delta, className }: { delta: number; className?: string }) {
  const positive = delta >= 0;
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 text-xs font-semibold",
      positive ? "text-emerald-600" : "text-red-500",
      className
    )}>
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {positive ? "+" : ""}{delta}% vs last week
    </span>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}
