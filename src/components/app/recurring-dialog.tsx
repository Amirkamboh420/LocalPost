"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Repeat2, Loader2, Calendar, Check } from "lucide-react";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";

type Pattern = "daily" | "weekly" | "weekdays" | "monthly" | "custom";

const PATTERNS: { value: Pattern; label: string; desc: string; icon: string }[] = [
  { value: "daily", label: "Daily", desc: "Har din same time", icon: "🔁" },
  { value: "weekdays", label: "Weekdays", desc: "Mon–Fri, weekends skip", icon: "📅" },
  { value: "weekly", label: "Weekly", desc: "Har hafta same day", icon: "🗓️" },
  { value: "monthly", label: "Monthly", desc: "Har mahina same date", icon: "📆" },
  { value: "custom", label: "Custom", desc: "Har N din baad", icon: "⚙️" },
];

export function RecurringDialog({
  open,
  onOpenChange,
  basePostId,
  caption,
  scheduledAt,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  basePostId: string;
  caption: string;
  scheduledAt: string | null;
  onCreated: (posts: Post[]) => void;
}) {
  const [pattern, setPattern] = useState<Pattern>("daily");
  const [count, setCount] = useState(5);
  const [intervalDays, setIntervalDays] = useState(3);
  const [creating, setCreating] = useState(false);
  const [preview, setPreview] = useState<string[]>([]);

  // generate preview dates
  function buildPreview(): string[] {
    const base = scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 3600000);
    const out: string[] = [];
    for (let i = 1; i <= Math.min(count, 6); i++) {
      const next = new Date(base);
      if (pattern === "daily") next.setDate(next.getDate() + i);
      else if (pattern === "weekly") next.setDate(next.getDate() + i * 7);
      else if (pattern === "monthly") next.setMonth(next.getMonth() + i);
      else if (pattern === "weekdays") {
        let added = 0;
        const tmp = new Date(base);
        while (added < i) {
          tmp.setDate(tmp.getDate() + 1);
          if (tmp.getDay() !== 0 && tmp.getDay() !== 6) added++;
        }
        next.setTime(tmp.getTime());
      } else {
        next.setDate(next.getDate() + i * Math.max(1, intervalDays));
      }
      out.push(
        next.toLocaleString("en-PK", {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
    return out;
  }

  function refreshPreview() {
    setPreview(buildPreview());
  }

  // recompute preview whenever pattern/count/interval change
  useState(() => refreshPreview());

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basePostId,
          pattern,
          count,
          intervalDays,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCreated(data.posts);
      toast.success(`${data.created} recurring posts schedule ho gaye!`);
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Recurring creation fail");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat2 className="h-5 w-5 text-saffron" /> Repeat schedule
          </DialogTitle>
          <DialogDescription>
            Is post ko recurring series mein convert karein.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* base post preview */}
          <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-3">
            <div className="text-[10px] uppercase font-semibold text-[#6b6b73] mb-1">Base post</div>
            <p className="text-sm text-[#14213d] line-clamp-2 leading-relaxed">{caption}</p>
            {scheduledAt && (
              <div className="text-xs text-[#6b6b73] mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(scheduledAt).toLocaleString("en-PK", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              </div>
            )}
          </div>

          {/* pattern select */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase text-[#6b6b73]">Repeat pattern</Label>
            <div className="grid grid-cols-1 gap-2">
              {PATTERNS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => { setPattern(p.value); setTimeout(refreshPreview, 0); }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-colors",
                    pattern === p.value
                      ? "border-saffron bg-[#fffdf8]"
                      : "border-[#e5e5e5] hover:border-[#6b6b73]/40"
                  )}
                >
                  <span className="text-lg">{p.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#14213d]">{p.label}</div>
                    <div className="text-xs text-[#6b6b73]">{p.desc}</div>
                  </div>
                  {pattern === p.value && <Check className="h-4 w-4 text-saffron" />}
                </button>
              ))}
            </div>
          </div>

          {/* count */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-[#6b6b73]">Occurrences</Label>
              <Select value={String(count)} onValueChange={(v) => { setCount(Number(v)); setTimeout(refreshPreview, 0); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[3, 5, 7, 10, 15, 20, 30].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} posts</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {pattern === "custom" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase text-[#6b6b73]">Every (days)</Label>
                <Select value={String(intervalDays)} onValueChange={(v) => { setIntervalDays(Number(v)); setTimeout(refreshPreview, 0); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 7, 10, 14].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} days</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* preview */}
          <div className="rounded-lg border border-saffron/30 bg-[#fffdf8] p-3">
            <div className="text-[10px] uppercase font-semibold text-[#6b6b73] mb-2">
              Preview — first {Math.min(count, 6)} dates
            </div>
            <div className="space-y-1.5">
              {(preview.length ? preview : buildPreview()).map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="grid place-items-center h-5 w-5 rounded-full bg-saffron/20 text-saffron text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <span className="text-[#14213d] font-medium">{d}</span>
                </div>
              ))}
              {count > 6 && (
                <div className="text-xs text-[#6b6b73] pl-7">+{count - 6} aur…</div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-[#e5e5e5] text-[#14213d]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="flex-1 gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand"
            >
              {creating ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
              ) : (
                <><Repeat2 className="h-4 w-4" /> {count} posts create karein</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
