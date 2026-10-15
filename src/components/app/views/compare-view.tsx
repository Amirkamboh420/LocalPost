"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/store/app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  GitCompare,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Bookmark,
  TrendingUp,
  Trophy,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { PlatformIcon, PostThumb, EmptyState } from "@/components/app/shared";
import type { Post, Platform } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CompareData {
  a: {
    id: string; caption: string; mediaUrls: string[]; platform: Platform;
    accountHandle: string; publishedAt: string | null; hashtags: string[];
    metrics: { likes: number; comments: number; shares: number; reach: number; impressions: number; saves: number; engagementRate: number } | null;
  };
  b: CompareData["a"];
  winners: Record<string, "a" | "b" | "tie">;
  overall: "a" | "b" | "tie";
}

const METRICS = [
  { key: "reach", label: "Reach", icon: Eye, color: "#fca311" },
  { key: "likes", label: "Likes", icon: Heart, color: "#e5484d" },
  { key: "comments", label: "Comments", icon: MessageCircle, color: "#1877f2" },
  { key: "shares", label: "Shares", icon: Share2, color: "#10b981" },
  { key: "saves", label: "Saves", icon: Bookmark, color: "#14213d" },
  { key: "engagementRate", label: "Eng Rate", icon: TrendingUp, color: "#8b5cf6", suffix: "%" },
];

export function CompareView() {
  const posts = useApp((s) => s.posts);
  const published = posts.filter((p) => p.status === "published" && p.metrics);
  const [aId, setAId] = useState("");
  const [bId, setBId] = useState("");
  const [data, setData] = useState<CompareData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (published.length >= 2 && !aId) setAId(published[0].id);
    if (published.length >= 2 && !bId) setBId(published[1].id);
  }, [published.length]);

  async function runCompare() {
    if (!aId || !bId) {
      toast.error("Do posts select karein");
      return;
    }
    if (aId === bId) {
      toast.error("Do alag alag posts select karein");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/compare?a=${aId}&b=${bId}`, { cache: "no-store" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setData(d);
    } catch (e: any) {
      toast.error(e.message || "Compare fail");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-[#14213d] flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-saffron" /> A/B post comparison
        </h2>
        <p className="text-sm text-[#6b6b73] mt-1">
          Do published posts side-by-side compare karein. Dekhein kaunsa post better perform kiya aur kyun.
        </p>
      </div>

      {published.length < 2 ? (
        <Card className="border-dashed border-[#e5e5e5]">
          <EmptyState
            icon={GitCompare}
            title="Compare karne ke liye 2+ published posts chahiye"
            desc={`Aap ke paas abhi sirf ${published.length} published post(s) hain. Aur posts publish karein to A/B comparison enable ho jayega.`}
          />
        </Card>
      ) : (
        <>
          {/* selectors */}
          <Card className="border-[#e5e5e5]">
            <CardContent className="p-4">
              <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-[#6b6b73]">Post A</Label>
                  <Select value={aId} onValueChange={setAId}>
                    <SelectTrigger><SelectValue placeholder="Pehli post" /></SelectTrigger>
                    <SelectContent>
                      {published.map((p) => (
                        <SelectItem key={p.id} value={p.id} disabled={p.id === bId}>
                          {p.caption.slice(0, 40)}{p.caption.length > 40 ? "…" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase text-[#6b6b73]">Post B</Label>
                  <Select value={bId} onValueChange={setBId}>
                    <SelectTrigger><SelectValue placeholder="Doosri post" /></SelectTrigger>
                    <SelectContent>
                      {published.map((p) => (
                        <SelectItem key={p.id} value={p.id} disabled={p.id === aId}>
                          {p.caption.slice(0, 40)}{p.caption.length > 40 ? "…" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={runCompare}
                  disabled={loading || !aId || !bId || aId === bId}
                  className="gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand h-10"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><GitCompare className="h-4 w-4" /> Compare</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* result */}
          {data && (
            <CompareResult data={data} />
          )}
        </>
      )}
    </div>
  );
}

function CompareResult({ data }: { data: CompareData }) {
  const a = data.a;
  const b = data.b;
  return (
    <div className="space-y-5">
      {/* overall winner banner */}
      {data.overall !== "tie" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-4">
          <div className="grid place-items-center h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
            <Trophy className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-emerald-900">
              Winner: Post {data.overall === "a" ? "A" : "B"}
            </div>
            <div className="text-xs text-emerald-700 mt-0.5">
              "{(data.overall === "a" ? a : b).caption.slice(0, 60)}…"
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => useApp.getState().openDetail(data.overall === "a" ? a.id : b.id)}
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
          >
            View details <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* side-by-side posts */}
      <div className="grid md:grid-cols-2 gap-4">
        <PostSide post={a} label="A" isWinner={data.overall === "a"} />
        <PostSide post={b} label="B" isWinner={data.overall === "b"} />
      </div>

      {/* metrics comparison table */}
      <Card className="border-[#e5e5e5]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-saffron" /> Metrics breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {/* header */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center pb-2 border-b border-[#e5e5e5]">
              <div className="text-xs font-bold text-[#14213d] text-right">Post A</div>
              <div className="text-[10px] uppercase text-[#6b6b73] text-center w-20">Metric</div>
              <div className="text-xs font-bold text-[#14213d] text-left">Post B</div>
            </div>
            {METRICS.map((m) => {
              const va = a.metrics ? (a.metrics as any)[m.key] as number : 0;
              const vb = b.metrics ? (b.metrics as any)[m.key] as number : 0;
              const winner = data.winners[m.key];
              const total = va + vb;
              const aPct = total > 0 ? (va / total) * 100 : 50;
              return (
                <div key={m.key} className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center py-1.5">
                  {/* A side */}
                  <div className="flex items-center justify-end gap-2">
                    <span className={cn("text-sm font-bold", winner === "a" ? "text-emerald-600" : "text-[#14213d]")}>
                      {fmt(va)}{m.suffix}
                    </span>
                    {winner === "a" && <Trophy className="h-3.5 w-3.5 text-emerald-500" />}
                  </div>
                  {/* center */}
                  <div className="text-center w-20">
                    <m.icon className="h-4 w-4 mx-auto" style={{ color: m.color }} />
                    <div className="text-[10px] text-[#6b6b73] uppercase mt-0.5">{m.label}</div>
                    {/* split bar */}
                    <div className="mt-1 h-1.5 rounded-full bg-[#f4f4f5] overflow-hidden flex">
                      <div className="h-full bg-emerald-500" style={{ width: `${aPct}%` }} />
                      <div className="h-full bg-saffron" style={{ width: `${100 - aPct}%` }} />
                    </div>
                  </div>
                  {/* B side */}
                  <div className="flex items-center gap-2">
                    {winner === "b" && <Trophy className="h-3.5 w-3.5 text-emerald-500" />}
                    <span className={cn("text-sm font-bold", winner === "b" ? "text-emerald-600" : "text-[#14213d]")}>
                      {fmt(vb)}{m.suffix}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-[#6b6b73]">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Post A</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-saffron" /> Post B</span>
            <span className="flex items-center gap-1"><Trophy className="h-3 w-3 text-emerald-500" /> Winner</span>
          </div>
        </CardContent>
      </Card>

      {/* insights */}
      <Card className="border-saffron/30 bg-[#fffdf8]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-lg bg-saffron/20 shrink-0">
              <Sparkles className="h-5 w-5 text-saffron" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#14213d]">AI insight</h4>
              <p className="text-xs text-[#6b6b73] mt-1 leading-relaxed">
                {data.overall === "tie"
                  ? "Dono posts ne similar performance kiya. Content variety try karein — alag alag angles (e.g. storytelling vs promotional) test karein."
                  : `Post ${data.overall === "a" ? "A" : "B"} ne ${winningReason(data)} ki wajah se behtar perform kiya. Is pattern ko future posts mein repeat karein.`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PostSide({ post, label, isWinner }: { post: CompareData["a"]; label: string; isWinner: boolean }) {
  return (
    <Card className={cn("border overflow-hidden", isWinner ? "border-emerald-300 ring-2 ring-emerald-200" : "border-[#e5e5e5]")}>
      <div className={cn("flex items-center justify-between px-4 py-2", isWinner ? "bg-emerald-50" : "bg-[#fafafa]")}>
        <div className="flex items-center gap-2">
          <span className={cn("grid place-items-center h-6 w-6 rounded-full text-xs font-bold", isWinner ? "bg-emerald-500 text-white" : "bg-[#14213d] text-white")}>
            {label}
          </span>
          <span className="text-xs text-[#6b6b73] flex items-center gap-1">
            <PlatformIcon platform={post.platform} className="h-3 w-3" />
            {post.accountHandle}
          </span>
        </div>
        {isWinner && (
          <Badge className="bg-emerald-500 text-white border-0 text-[10px]">
            <Trophy className="h-3 w-3 mr-1" /> Winner
          </Badge>
        )}
      </div>
      {post.mediaUrls?.[0] && (
        <div className="aspect-video bg-[#f4f4f5] overflow-hidden">
          <img src={post.mediaUrls[0]} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="p-3">
        <p className="text-xs text-[#14213d] line-clamp-3 leading-relaxed">{post.caption}</p>
        {post.publishedAt && (
          <div className="text-[10px] text-[#6b6b73] mt-2">
            Published {new Date(post.publishedAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
          </div>
        )}
      </div>
    </Card>
  );
}

function winningReason(data: CompareData): string {
  if (!data.a.metrics || !data.b.metrics) return "unknown";
  const a = data.a.metrics;
  const b = data.b.metrics;
  if (a.engagementRate > b.engagementRate) return "higher engagement rate";
  if (a.reach > b.reach) return "zyada reach";
  if (a.likes > b.likes) return "zyada likes";
  return "better performance";
}

function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}
