"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/store/app-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  UserPlus,
  Eye,
  Trash2,
  Loader2,
  TrendingUp,
  Users,
  Zap,
  Search,
  Crown,
} from "lucide-react";
import { PlatformIcon, EmptyState } from "@/components/app/shared";
import type { Competitor } from "@/lib/types";
import { cn } from "@/lib/utils";

const FREQ_META: Record<string, { label: string; color: string }> = {
  daily: { label: "Daily", color: "bg-emerald-50 text-emerald-600" },
  weekly: { label: "Weekly", color: "bg-blue-50 text-blue-600" },
  irregular: { label: "Irregular", color: "bg-[#f4f4f5] text-[#6b6b73]" },
};

const SUGGESTED = [
  "karachi.styles",
  "the.crafty.shop",
  "boutique.lhr",
  "urbandecor.pk",
];

export function CompetitorsView() {
  const user = useApp((s) => s.user);
  const accounts = useApp((s) => s.accounts);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/competitors", { cache: "no-store" });
      const data = await res.json();
      setCompetitors(data.competitors || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!handle.trim()) {
      toast.error("Handle zaroori hai");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, platform }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCompetitors([data.competitor, ...competitors]);
      toast.success(`${data.competitor.displayName} add ho gaya!`);
      setAddOpen(false);
      setHandle("");
    } catch (e: any) {
      toast.error(e.message || "Add fail");
    } finally {
      setAdding(false);
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`${name} ko remove karein?`)) return;
    try {
      await fetch(`/api/competitors/${id}`, { method: "DELETE" });
      setCompetitors(competitors.filter((c) => c.id !== id));
      toast.success("Competitor remove ho gaya");
    } catch {
      toast.error("Remove fail");
    }
  }

  // aggregate stats
  const myFollowers = accounts.reduce((s, a) => s + a.followers, 0);
  const compFollowers = competitors.reduce((s, c) => s + c.followers, 0);
  const myEng = accounts.length > 0 ? 4.2 : 0; // mock
  const avgCompEng = competitors.length > 0
    ? competitors.reduce((s, c) => s + c.avgEngagement, 0) / competitors.length
    : 0;

  const filtered = competitors.filter((c) =>
    !search || c.handle.toLowerCase().includes(search.toLowerCase()) || c.displayName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#14213d] flex items-center gap-2">
            <Eye className="h-5 w-5 text-saffron" /> Competitor tracking
          </h2>
          <p className="text-sm text-[#6b6b73] mt-1">
            Apne competitors ko monitor karein. Followers, engagement, posting frequency compare karein.
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          disabled={competitors.length >= 10}
          className="gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand"
        >
          <UserPlus className="h-4 w-4" /> Add competitor
        </Button>
      </div>

      {/* summary */}
      {competitors.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="border-[#e5e5e5] p-4">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center h-10 w-10 rounded-lg bg-[#14213d]">
                <Users className="h-5 w-5 text-saffron" />
              </div>
              <div>
                <div className="text-xs text-[#6b6b73]">Your followers</div>
                <div className="text-xl font-bold text-[#14213d]">{formatNum(myFollowers)}</div>
              </div>
            </div>
          </Card>
          <Card className="border-[#e5e5e5] p-4">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center h-10 w-10 rounded-lg bg-saffron/20">
                <Users className="h-5 w-5 text-saffron" />
              </div>
              <div>
                <div className="text-xs text-[#6b6b73]">Competitors avg</div>
                <div className="text-xl font-bold text-[#14213d]">{formatNum(Math.round(compFollowers / competitors.length))}</div>
              </div>
            </div>
          </Card>
          <Card className="border-[#e5e5e5] p-4">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center h-10 w-10 rounded-lg bg-emerald-50">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-[#6b6b73]">Eng rate (you vs them)</div>
                <div className="text-xl font-bold text-[#14213d]">
                  {myEng}% <span className="text-xs text-[#6b6b73]">vs {avgCompEng.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* search */}
      {competitors.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b73]" />
          <Input
            placeholder="Competitors search karein…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 max-w-md"
          />
        </div>
      )}

      {/* list */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-[#f4f4f5] shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-[#e5e5e5]">
          <EmptyState
            icon={Eye}
            title="Abhi koi competitor track nahi"
            desc="Apne competitors ke handles add karein. Unki engagement aur posting strategy monitor karein."
            action={
              <Button onClick={() => setAddOpen(true)} className="gradient-saffron text-[#14213d] font-semibold">
                <UserPlus className="h-4 w-4" /> Pehla competitor add karein
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((c) => {
            const isLeading = c.followers < myFollowers;
            return (
              <Card key={c.id} className="border-[#e5e5e5] p-4 hover:shadow-navy transition-shadow group">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 border-2" style={{ borderColor: c.color + "40" }}>
                    <AvatarFallback
                      className="text-white font-bold"
                      style={{ backgroundColor: c.color }}
                    >
                      {c.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-[#14213d] truncate">{c.displayName}</h3>
                      {isLeading && (
                        <Badge className="bg-emerald-50 text-emerald-600 border-0 text-[10px]">
                          <Crown className="h-3 w-3 mr-1" /> You lead
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#6b6b73]">
                      <PlatformIcon platform={c.platform} className="h-3 w-3" />
                      @{c.handle}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(c.id, c.displayName)}
                    className="grid place-items-center h-8 w-8 rounded-lg text-[#6b6b73] hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Stat label="Followers" value={formatNum(c.followers)} />
                  <Stat label="Eng Rate" value={`${c.avgEngagement}%`} />
                  <Stat label="Frequency" value={FREQ_META[c.postFrequency]?.label || c.postFrequency} />
                </div>
                {/* progress bar comparing to you */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-[#6b6b73] mb-1">
                    <span>Followers vs you</span>
                    <span>{c.followers > myFollowers ? `+${formatNum(c.followers - myFollowers)}` : `-${formatNum(myFollowers - c.followers)}`}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#f4f4f5] overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: `${(myFollowers / (myFollowers + c.followers)) * 100}%` }} />
                    <div className="h-full" style={{ width: `${(c.followers / (myFollowers + c.followers)) * 100}%`, backgroundColor: c.color }} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-saffron" /> Competitor add karein
            </DialogTitle>
            <DialogDescription>
              Handle daalein — followers, engagement, posting frequency auto-fetch hoga.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3.5 mt-2">
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="twitter">X / Twitter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Handle (without @)</Label>
              <Input
                value={handle}
                onChange={(e) => setHandle(e.target.value.replace(/^@/, ""))}
                placeholder="e.g. karachi.styles"
              />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <span className="text-[10px] text-[#6b6b73] mr-1">Suggestions:</span>
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => setHandle(s)}
                    className="text-[11px] rounded-full bg-white border border-[#e5e5e5] px-2 py-0.5 text-[#6b6b73] hover:border-saffron hover:text-saffron transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={handleAdd}
              disabled={adding || !handle.trim()}
              className="w-full gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand"
            >
              {adding ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Fetching data…</>
              ) : (
                <><Zap className="h-4 w-4" /> Add & track</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#fafafa] p-2 text-center">
      <div className="text-sm font-bold text-[#14213d]">{value}</div>
      <div className="text-[10px] text-[#6b6b73] uppercase">{label}</div>
    </div>
  );
}

function formatNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}
