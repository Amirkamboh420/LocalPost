"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Eye,
  Share2,
  Bookmark,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Loader2,
  Trophy,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PlatformIcon } from "@/components/app/shared";
import type { Platform } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MetricsData {
  post: { id: string; caption: string; platform: Platform; publishedAt: string | null };
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    impressions: number;
    saves: number;
    engagementRate: number;
  } | null;
  series: { day: number; date: string; label: string; likes: number; reach: number; comments: number; impressions: number }[];
  benchmark: { accountAvgReach: number; vsAverage: number; totalPublished: number };
}

export function PostAnalyticsDialog({
  open,
  onOpenChange,
  postId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  postId: string;
}) {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !postId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/posts/${postId}/metrics`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, postId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scroll-area-brand">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-saffron" /> Post analytics
          </DialogTitle>
          <DialogDescription>
            Is post ki performance aur benchmark vs account average.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-saffron animate-spin" />
            <p className="text-sm text-[#6b6b73]">Analytics load ho rahe hain…</p>
          </div>
        ) : !data ? (
          <p className="text-sm text-[#6b6b73] py-8 text-center">Data load nahi ho saka.</p>
        ) : (
          <div className="space-y-5 mt-2">
            {/* post header */}
            <div className="rounded-xl border border-[#e5e5e5] p-4 bg-[#fafafa]">
              <div className="flex items-center gap-2 mb-2">
                <PlatformIcon platform={data.post.platform} className="h-4 w-4" />
                <span className="text-xs text-[#6b6b73] capitalize">{data.post.platform}</span>
                {data.post.publishedAt && (
                  <span className="text-xs text-[#6b6b73]">
                    · Published {new Date(data.post.publishedAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                  </span>
                )}
              </div>
              <p className="text-sm text-[#14213d] line-clamp-2 leading-relaxed">{data.post.caption}</p>
            </div>

            {data.metrics ? (
              <>
                {/* metrics grid */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <MetricChip icon={Heart} label="Likes" value={data.metrics.likes} color="#e5484d" />
                  <MetricChip icon={MessageCircle} label="Comments" value={data.metrics.comments} color="#1877f2" />
                  <MetricChip icon={Share2} label="Shares" value={data.metrics.shares} color="#10b981" />
                  <MetricChip icon={Eye} label="Reach" value={fmt(data.metrics.reach)} color="#fca311" />
                  <MetricChip icon={Bookmark} label="Saves" value={data.metrics.saves} color="#14213d" />
                  <MetricChip icon={TrendingUp} label="Eng Rate" value={`${data.metrics.engagementRate}%`} color="#8b5cf6" />
                </div>

                {/* benchmark banner */}
                <div className={cn(
                  "rounded-xl border p-4 flex items-center gap-4",
                  data.benchmark.vsAverage >= 0
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-[#e5e5e5] bg-[#fafafa]"
                )}>
                  <div className={cn(
                    "grid place-items-center h-12 w-12 rounded-xl shrink-0",
                    data.benchmark.vsAverage >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-[#f4f4f5] text-[#6b6b73]"
                  )}>
                    {data.benchmark.vsAverage >= 0 ? <Trophy className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-[#14213d]">
                      {data.benchmark.vsAverage >= 0 ? "Above average!" : "Below average"}
                    </div>
                    <div className="text-xs text-[#6b6b73]">
                      This post ke {Math.abs(data.benchmark.vsAverage)}% {data.benchmark.vsAverage >= 0 ? "zyada" : "kam"} reach vs aap ke account average ({fmt(data.benchmark.accountAvgReach)}).
                    </div>
                  </div>
                  <div className={cn(
                    "text-2xl font-extrabold",
                    data.benchmark.vsAverage >= 0 ? "text-emerald-600" : "text-[#6b6b73]"
                  )}>
                    {data.benchmark.vsAverage >= 0 ? "+" : ""}{data.benchmark.vsAverage}%
                  </div>
                </div>

                {/* timeseries chart */}
                <Card className="border-[#e5e5e5] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-[#14213d] flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-saffron" /> Engagement over time
                    </h4>
                    <Badge variant="outline" className="border-[#e5e5e5] text-[#6b6b73]">First 7 days</Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={data.series} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fca311" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#fca311" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="likesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#14213d" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#14213d" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b6b73" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#6b6b73" }} axisLine={false} tickLine={false} width={40} />
                      <Tooltip
                        contentStyle={{ background: "#14213d", border: "none", borderRadius: 10, color: "white", fontSize: 12 }}
                        labelStyle={{ color: "#fca311", fontWeight: 700 }}
                      />
                      <Area type="monotone" dataKey="reach" stroke="#fca311" strokeWidth={2.5} fill="url(#reachGrad)" name="Reach" />
                      <Area type="monotone" dataKey="likes" stroke="#14213d" strokeWidth={2.5} fill="url(#likesGrad)" name="Likes" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                {/* daily breakdown */}
                <div>
                  <h4 className="text-sm font-bold text-[#14213d] mb-2">Daily breakdown</h4>
                  <div className="space-y-1.5">
                    {data.series.map((s) => (
                      <div key={s.day} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#fafafa] transition-colors">
                        <span className="text-xs font-semibold text-[#6b6b73] w-12 shrink-0">{s.label}</span>
                        <div className="flex-1 flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-[#14213d]">
                            <Eye className="h-3 w-3 text-saffron" /> {fmt(s.reach)}
                          </span>
                          <span className="flex items-center gap-1 text-[#14213d]">
                            <Heart className="h-3 w-3 text-red-500" /> {s.likes}
                          </span>
                          <span className="flex items-center gap-1 text-[#14213d]">
                            <MessageCircle className="h-3 w-3 text-blue-500" /> {s.comments}
                          </span>
                        </div>
                        {/* mini bar */}
                        <div className="w-20 h-1.5 rounded-full bg-[#f4f4f5] overflow-hidden">
                          <div
                            className="h-full gradient-saffron"
                            style={{ width: `${Math.min(100, (s.reach / (data.series[0]?.reach || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-10 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-[#6b6b73]/40 mb-2" />
                <p className="text-sm text-[#6b6b73]">Is post ke liye abhi metrics available nahi.</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MetricChip({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-lg border border-[#e5e5e5] p-2.5 text-center">
      <Icon className="h-4 w-4 mx-auto mb-1" style={{ color }} />
      <div className="text-sm font-bold text-[#14213d]">{value}</div>
      <div className="text-[10px] text-[#6b6b73] uppercase tracking-wide">{label}</div>
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}
