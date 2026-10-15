"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Users,
  Trophy,
  BarChart3,
  Clock,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PlatformIcon, EmptyState, PostThumb } from "@/components/app/shared";
import type { Platform } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  summary: {
    totalPosts: number;
    totalReach: number;
    totalLikes: number;
    totalComments: number;
    totalImpressions: number;
    totalShares: number;
    totalFollowers: number;
    engagementRate: number;
    accountsConnected: number;
  };
  timeseries: { date: string; reach: number; engagement: number; posts: number }[];
  platformBreakdown: {
    platform: Platform;
    handle: string;
    followers: number;
    posts: number;
    reach: number;
    likes: number;
  }[];
  topPosts: {
    id: string;
    caption: string;
    reach: number;
    likes: number;
    comments: number;
    platform: Platform;
    publishedAt: string | null;
  }[];
}

const PLATFORM_COLORS: Record<Platform, string> = {
  instagram: "#E1306C",
  facebook: "#1877F2",
  twitter: "#0F1419",
  linkedin: "#0A66C2",
  tiktok: "#000000",
};

export function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"7d" | "30d" | "all">("7d");

  useEffect(() => {
    fetch("/api/analytics", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-[#f4f4f5] animate-pulse" />
          ))}
        </div>
        <div className="h-72 rounded-xl bg-[#f4f4f5] animate-pulse mt-6" />
      </div>
    );
  }

  if (!data || data.summary.totalPosts === 0) {
    return (
      <Card className="border-[#e5e5e5] max-w-3xl mx-auto mt-10">
        <EmptyState
          icon={BarChart3}
          title="Abhi analytics available nahi"
          desc="Jab aap posts publish karenge tab yahan reach, likes, comments aur engagement trends dikhenge."
        />
      </Card>
    );
  }

  const s = data.summary;
  const chartData = data.timeseries.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-PK", { weekday: "short" }).slice(0, 3),
  }));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* range filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#14213d]">Performance overview</h2>
        <div className="flex rounded-lg border border-[#e5e5e5] p-0.5 bg-white">
          {(["7d", "30d", "all"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                range === r ? "gradient-saffron text-[#14213d]" : "text-[#6b6b73] hover:bg-[#fafafa]"
              }`}
            >
              {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "All time"}
            </button>
          ))}
        </div>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Eye} label="Total Reach" value={fmt(s.totalReach)} delta="+24%" color="#fca311" />
        <StatCard icon={Heart} label="Total Likes" value={fmt(s.totalLikes)} delta="+18%" color="#e5484d" />
        <StatCard icon={MessageCircle} label="Comments" value={fmt(s.totalComments)} delta="+12%" color="#1877f2" />
        <StatCard icon={TrendingUp} label="Engagement Rate" value={`${s.engagementRate}%`} delta="+0.8%" color="#10b981" />
      </div>

      {/* charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-[#e5e5e5]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-saffron" />
              Reach & engagement — last 7 days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="reach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fca311" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#fca311" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="eng" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14213d" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#14213d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b6b73" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6b6b73" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{
                    background: "#14213d",
                    border: "none",
                    borderRadius: 12,
                    color: "white",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#fca311", fontWeight: 700 }}
                />
                <Area
                  type="monotone"
                  dataKey="reach"
                  stroke="#fca311"
                  strokeWidth={2.5}
                  fill="url(#reach)"
                  name="Reach"
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="#14213d"
                  strokeWidth={2.5}
                  fill="url(#eng)"
                  name="Engagement"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#e5e5e5]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-saffron" />
              Platform breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.platformBreakdown} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: "#6b6b73" }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="platform"
                  tick={{ fontSize: 11, fill: "#14213d" }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                  tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1, 4)}
                />
                <Tooltip
                  contentStyle={{ background: "#14213d", border: "none", borderRadius: 12, color: "white", fontSize: 12 }}
                  cursor={{ fill: "#fff5e6" }}
                />
                <Bar dataKey="reach" radius={[0, 6, 6, 0]}>
                  {data.platformBreakdown.map((entry, i) => (
                    <Bar key={i} fill={PLATFORM_COLORS[entry.platform] || "#fca311"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-2">
              {data.platformBreakdown.map((p) => (
                <div key={p.handle} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform={p.platform} className="h-3.5 w-3.5" />
                    <span className="font-medium text-[#14213d]">{p.handle}</span>
                  </div>
                  <span className="text-[#6b6b73]">{fmt(p.reach)} reach</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniBox icon={Share2} label="Shares" value={fmt(s.totalShares)} />
        <MiniBox icon={Eye} label="Impressions" value={fmt(s.totalImpressions)} />
        <MiniBox icon={Users} label="Followers" value={fmt(s.totalFollowers)} />
        <MiniBox icon={Trophy} label="Posts published" value={String(s.totalPosts)} />
      </div>

      {/* best time heatmap */}
      <BestTimeHeatmap />

      {/* top posts */}
      <Card className="border-[#e5e5e5]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-saffron" />
            Top performing posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.topPosts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#fafafa] transition-colors">
                <div className="grid place-items-center h-7 w-7 rounded-full bg-[#fff5e6] text-saffron font-bold text-xs shrink-0">
                  {i + 1}
                </div>
                <PostThumb post={{ mediaUrls: [], caption: p.caption, mediaType: "image" }} className="h-11 w-11 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#14213d] line-clamp-1">{p.caption}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-[#6b6b73]">
                    <span className="flex items-center gap-1">
                      <PlatformIcon platform={p.platform} className="h-3 w-3" />
                      {p.platform}
                    </span>
                    {p.publishedAt && (
                      <span>{new Date(p.publishedAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs shrink-0">
                  <div className="text-center">
                    <div className="font-bold text-[#14213d]">{fmt(p.reach)}</div>
                    <div className="text-[10px] text-[#6b6b73]">reach</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-[#14213d]">{p.likes}</div>
                    <div className="text-[10px] text-[#6b6b73]">likes</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BestTimeHeatmap() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [data, setData] = useState<{
    source: string;
    heatmap: number[][];
    peakTimes: { day: string; hour: number; label: string; score: number; eng: number; posts: number }[];
    sampleSize: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/best-time", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  // Use 12 hour-slots from 8am..8pm (hours 8-20)
  const hourSlots = Array.from({ length: 13 }, (_, i) => i + 8); // 8..20
  const hourLabels = ["8a", "10a", "12p", "2p", "4p", "6p", "8p"];

  const intensities = data?.heatmap
    ? days.map((_, dIdx) =>
        hourSlots.map((h) => data.heatmap[dIdx]?.[h] ?? 0)
      )
    : days.map(() => hourSlots.map(() => 0));

  const peaks = data?.peakTimes || [];
  const peak1 = peaks[0];
  const peak2 = peaks[1];
  // find lowest slot
  let minVal = 1, minLabel = "8 AM";
  for (let d = 0; d < 7; d++) {
    for (let i = 0; i < hourSlots.length; i++) {
      const v = intensities[d][i];
      if (v < minVal && v > 0) {
        minVal = v;
        minLabel = `${days[d]} ${hourSlots[i] >= 12 ? (hourSlots[i] === 12 ? "12p" : `${hourSlots[i]-12}p`) : `${hourSlots[i]}a`}`;
      }
    }
  }

  return (
    <Card className="border-[#e5e5e5]">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Clock className="h-4 w-4 text-saffron" />
          Best time to post — engagement heatmap
          {data && (
            <Badge variant="outline" className={cn("text-[10px] ml-1", data.source === "real" ? "border-emerald-300 text-emerald-600" : "border-[#e5e5e5] text-[#6b6b73]")}>
              {data.source === "real" ? `${data.sampleSize} posts analyzed` : "default (no data yet)"}
            </Badge>
          )}
        </CardTitle>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#6b6b73]">
          Low
          <div className="flex gap-0.5">
            {[0.15, 0.35, 0.55, 0.75, 1].map((v, i) => (
              <span
                key={i}
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: `rgba(252,163,17,${v})` }}
              />
            ))}
          </div>
          High
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto scroll-area-brand">
          <div className="min-w-[560px]">
            {/* hour labels */}
            <div className="flex pl-12 mb-1">
              {hourLabels.map((h, i) => (
                <div key={h} className="flex-1 text-center text-[10px] font-medium text-[#6b6b73]">
                  {h}
                </div>
              ))}
            </div>
            {/* rows */}
            {days.map((d, dIdx) => (
              <div key={d} className="flex items-center mb-0.5">
                <div className="w-12 text-xs font-medium text-[#14213d] dark:text-white pr-2 text-right">{d}</div>
                <div className="flex-1 flex gap-0.5">
                  {intensities[dIdx].map((v, hIdx) => {
                    const hour = hourSlots[hIdx];
                    return (
                      <div
                        key={hIdx}
                        className="group relative flex-1 aspect-[2/1] rounded-sm cursor-pointer transition-transform hover:scale-105 hover:ring-2 hover:ring-saffron"
                        style={{ backgroundColor: `rgba(252,163,17,${Math.max(0.06, v)})` }}
                        title={`${d} ${hour >= 12 ? (hour === 12 ? "12pm" : `${hour-12}pm`) : `${hour}am`} · ${Math.round(v * 100)}% engagement`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-saffron/30 bg-[#fff5e6] p-3">
            <div className="text-xs text-[#6b6b73]">Peak time</div>
            <div className="text-lg font-bold text-[#14213d] dark:text-white">{peak1?.label ?? "7:00 PM"}</div>
            <div className="text-[11px] text-saffron">{peak1 ? `${Math.round(peak1.score * 100)}% score · ${peak1.posts} posts` : "Fri & Sat"}</div>
          </div>
          <div className="rounded-lg border border-[#e5e5e5] p-3">
            <div className="text-xs text-[#6b6b73]">Secondary window</div>
            <div className="text-lg font-bold text-[#14213d] dark:text-white">{peak2?.label ?? "12:00 PM"}</div>
            <div className="text-[11px] text-[#6b6b73]">{peak2 ? `${Math.round(peak2.score * 100)}% score` : "Lunch break"}</div>
          </div>
          <div className="rounded-lg border border-[#e5e5e5] p-3">
            <div className="text-xs text-[#6b6b73]">Avoid</div>
            <div className="text-lg font-bold text-[#14213d] dark:text-white">{minLabel}</div>
            <div className="text-[11px] text-[#6b6b73]">Lowest engagement</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ icon: Icon, label, value, delta, color }: { icon: any; label: string; value: string; delta: string; color: string }) {
  return (
    <Card className="border-[#e5e5e5] p-4 hover:shadow-navy transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-[#6b6b73] font-medium">{label}</span>
        <div className="grid place-items-center h-8 w-8 rounded-lg" style={{ backgroundColor: color + "20" }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <div className="mt-2 text-2xl font-extrabold text-[#14213d]">{value}</div>
      <div className="mt-0.5 text-xs text-emerald-600 font-medium flex items-center gap-1">
        <TrendingUp className="h-3 w-3" /> {delta} vs last week
      </div>
    </Card>
  );
}

function MiniBox({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="border-[#e5e5e5] p-3 flex items-center gap-3">
      <div className="grid place-items-center h-9 w-9 rounded-lg bg-[#14213d]">
        <Icon className="h-4 w-4 text-saffron" />
      </div>
      <div>
        <div className="text-lg font-bold text-[#14213d]">{value}</div>
        <div className="text-xs text-[#6b6b73]">{label}</div>
      </div>
    </Card>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}
