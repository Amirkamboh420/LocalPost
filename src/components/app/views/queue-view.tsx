"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/store/app-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Clock,
  Zap,
  Loader2,
  Play,
  AlertCircle,
  CheckCircle2,
  Radio,
} from "lucide-react";
import { PlatformBadge, StatusBadge, PostThumb, EmptyState } from "@/components/app/shared";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";

interface QueueData {
  due: Post[];
  upcoming: Post[];
  nextRunIn: string;
}

export function QueueView() {
  const [data, setData] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const openDetail = useApp((s) => s.openDetail);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/queue", { cache: "no-store" });
      const d = await res.json();
      setData(d);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function runCron() {
    setRunning(true);
    try {
      const res = await fetch("/api/cron/publish", {
        method: "POST",
        headers: { authorization: "Bearer localpost-cron-dev" },
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      toast.success(`${d.publishedCount} posts auto-published!`);
      load();
    } catch (e: any) {
      toast.error(e.message || "Cron run fail");
    } finally {
      setRunning(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-[#f4f4f5] shimmer" />
        ))}
      </div>
    );
  }

  const dueCount = data?.due.length ?? 0;
  const upcomingCount = data?.upcoming.length ?? 0;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#14213d] flex items-center gap-2">
            <Radio className="h-5 w-5 text-saffron" /> Publish queue
          </h2>
          <p className="text-sm text-[#6b6b73] mt-1">
            Scheduled posts jo auto-publish hone wale hain.
          </p>
        </div>
        <Button
          onClick={runCron}
          disabled={running}
          className="gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand"
        >
          {running ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Publishing…</>
          ) : (
            <><Play className="h-4 w-4" /> Run publisher now</>
          )}
        </Button>
      </div>

      {/* cron status */}
      <Card className="border-saffron/30 bg-[#fffdf8] p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="grid place-items-center h-10 w-10 rounded-lg bg-saffron/20">
              <Clock className="h-5 w-5 text-saffron" />
            </div>
            <div>
              <div className="text-xs text-[#6b6b73]">Next auto-publish in</div>
              <div className="text-lg font-bold text-[#14213d]">{data?.nextRunIn ?? "—"}</div>
            </div>
          </div>
          <div className="h-8 w-px bg-[#e5e5e5] hidden sm:block" />
          <div className="flex items-center gap-2 text-xs text-[#6b6b73]">
            <Zap className="h-4 w-4 text-saffron" />
            Cron runs every 5 min · finds due scheduled posts & publishes them
          </div>
        </div>
      </Card>

      {/* due posts */}
      {dueCount > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-bold text-[#14213d]">Due now ({dueCount})</h3>
            <Badge className="bg-amber-50 text-amber-700 border-0">Overdue</Badge>
          </div>
          <Card className="border-amber-200 divide-y divide-[#e5e5e5]">
            {data?.due.map((p) => (
              <QueueRow key={p.id} post={p} onClick={() => openDetail(p.id)} due />
            ))}
          </Card>
        </div>
      )}

      {/* upcoming */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-saffron" />
          <h3 className="text-sm font-bold text-[#14213d]">Upcoming ({upcomingCount})</h3>
        </div>
        {upcomingCount === 0 ? (
          <Card className="border-dashed border-[#e5e5e5]">
            <EmptyState
              icon={Clock}
              title="Koi upcoming scheduled post nahi"
              desc="Calendar mein posts schedule karein to yahan queue ban jayegi."
            />
          </Card>
        ) : (
          <Card className="border-[#e5e5e5] divide-y divide-[#e5e5e5]">
            {data?.upcoming.map((p) => (
              <QueueRow key={p.id} post={p} onClick={() => openDetail(p.id)} />
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

function QueueRow({ post, onClick, due }: { post: Post; onClick: () => void; due?: boolean }) {
  const date = post.scheduledAt ? new Date(post.scheduledAt) : null;
  const now = new Date();
  const isPast = date && date < now;
  const minsAgo = date ? Math.round((now.getTime() - date.getTime()) / 60000) : 0;
  const minsUntil = date ? Math.round((date.getTime() - now.getTime()) / 60000) : 0;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-[#fafafa] transition-colors text-left"
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
            {due && isPast && (
              <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
                {minsAgo}m ago
              </div>
            )}
            {!due && !isPast && (
              <div className={cn("text-[10px] font-semibold mt-0.5", minsUntil < 60 ? "text-saffron" : "text-[#6b6b73]")}>
                in {minsUntil < 60 ? `${minsUntil}m` : `${Math.floor(minsUntil / 60)}h ${minsUntil % 60}m`}
              </div>
            )}
          </>
        )}
      </div>
    </button>
  );
}
