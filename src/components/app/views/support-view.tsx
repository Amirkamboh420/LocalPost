"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/store/app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  LifeBuoy,
  Plus,
  Clock,
  MessageCircle,
  CheckCircle2,
  Loader2,
  Send,
  Reply,
  Filter,
} from "lucide-react";
import { EmptyState } from "@/components/app/shared";
import type { SupportTicket } from "@/lib/types";
import { canAccessAdmin } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  billing: { label: "Billing", color: "bg-saffron/15 text-[#b07300]" },
  technical: { label: "Technical", color: "bg-red-50 text-red-600" },
  feature_request: { label: "Feature Request", color: "bg-blue-50 text-blue-600" },
  account: { label: "Account", color: "bg-purple-50 text-purple-600" },
  other: { label: "Other", color: "bg-[#f4f4f5] text-[#6b6b73]" },
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "bg-amber-50 text-amber-700" },
  in_progress: { label: "In Progress", color: "bg-blue-50 text-blue-600" },
  resolved: { label: "Resolved", color: "bg-emerald-50 text-emerald-600" },
  closed: { label: "Closed", color: "bg-[#f4f4f5] text-[#6b6b73]" },
};

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "text-[#6b6b73]" },
  normal: { label: "Normal", color: "text-blue-600" },
  high: { label: "High", color: "text-saffron" },
  urgent: { label: "Urgent", color: "text-red-600" },
};

export function SupportView() {
  const user = useApp((s) => s.user);
  const isAdmin = canAccessAdmin(user?.role);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState("");

  // create form
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("technical");
  const [priority, setPriority] = useState("normal");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const url = isAdmin ? "/api/support?all=1" : "/api/support";
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      setTickets(data.tickets || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!subject.trim() || !message.trim()) {
      toast.error("Subject aur message zaroori hain");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, priority, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTickets([data.ticket, ...tickets]);
      toast.success("Ticket submit ho gaya! Hum jald reply karenge.");
      setCreateOpen(false);
      setSubject(""); setMessage(""); setCategory("technical"); setPriority("normal");
    } catch (e: any) {
      toast.error(e.message || "Submit fail");
    } finally {
      setCreating(false);
    }
  }

  async function handleReply() {
    if (!selected || !reply.trim()) return;
    try {
      const res = await fetch(`/api/support/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTickets(tickets.map((t) => (t.id === selected.id ? { ...t, reply: data.ticket.reply, status: data.ticket.status } : t)));
      setSelected({ ...selected, reply: data.ticket.reply, status: data.ticket.status });
      toast.success("Reply bhej diya");
      setReply("");
    } catch (e: any) {
      toast.error(e.message || "Reply fail");
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/support/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTickets(tickets.map((t) => (t.id === id ? { ...t, status: data.ticket.status } : t)));
      toast.success("Status update ho gaya");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  const filtered = tickets.filter((t) => {
    if (filter === "open") return t.status === "open" || t.status === "in_progress";
    if (filter === "resolved") return t.status === "resolved" || t.status === "closed";
    return true;
  });

  const openCount = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#14213d] flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-saffron" /> Support
          </h2>
          <p className="text-sm text-[#6b6b73] mt-1">
            {isAdmin ? "Saare support tickets manage karein" : "Help paayein ya apni query submit karein"}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand">
          <Plus className="h-4 w-4" /> New ticket
        </Button>
      </div>

      {/* stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-[#e5e5e5] p-3 text-center">
          <div className="text-xl font-bold text-[#14213d]">{tickets.length}</div>
          <div className="text-[10px] uppercase text-[#6b6b73]">Total</div>
        </Card>
        <Card className="border-[#e5e5e5] p-3 text-center">
          <div className="text-xl font-bold text-amber-600">{openCount}</div>
          <div className="text-[10px] uppercase text-[#6b6b73]">Open</div>
        </Card>
        <Card className="border-[#e5e5e5] p-3 text-center">
          <div className="text-xl font-bold text-emerald-600">{tickets.length - openCount}</div>
          <div className="text-[10px] uppercase text-[#6b6b73]">Resolved</div>
        </Card>
      </div>

      {/* filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-[#6b6b73]" />
        <div className="flex rounded-lg border border-[#e5e5e5] p-0.5 bg-white">
          {(["all", "open", "resolved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors",
                filter === f ? "gradient-saffron text-[#14213d]" : "text-[#6b6b73] hover:bg-[#fafafa]"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* list */}
      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-[#f4f4f5] shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-[#e5e5e5]">
          <EmptyState icon={LifeBuoy} title="Koi ticket nahi" desc="Naya support ticket submit karein ya pehle ke queries yahan dikhenge." />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => {
            const cat = CATEGORY_META[t.category] || CATEGORY_META.other;
            const st = STATUS_META[t.status] || STATUS_META.open;
            const pr = PRIORITY_META[t.priority] || PRIORITY_META.normal;
            return (
              <Card key={t.id} className="border-[#e5e5e5] p-4 hover:shadow-navy transition-shadow cursor-pointer" >
                <div className="flex items-start justify-between gap-3" onClick={() => setSelected(t)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", cat.color)}>{cat.label}</span>
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", st.color)}>{st.label}</span>
                      <span className={cn("text-[10px] font-semibold", pr.color)}>{pr.label} priority</span>
                      {isAdmin && (
                        <span className="text-[10px] text-[#6b6b73]">· {t.userName}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-[#14213d] text-sm">{t.subject}</h3>
                    <p className="text-xs text-[#6b6b73] mt-1 line-clamp-2 leading-relaxed">{t.message}</p>
                    {t.reply && (
                      <div className="mt-2 rounded-lg bg-[#fff5e6] border border-saffron/20 p-2">
                        <div className="text-[10px] font-semibold text-[#b07300] mb-0.5">Admin reply</div>
                        <p className="text-xs text-[#14213d]">{t.reply}</p>
                      </div>
                    )}
                    <div className="text-[10px] text-[#6b6b73] mt-2">{new Date(t.createdAt).toLocaleString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
                {isAdmin && t.status !== "resolved" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-[#e5e5e5]">
                    <Button size="sm" variant="outline" onClick={() => updateStatus(t.id, "in_progress")} className="border-[#e5e5e5] h-7 text-xs">Mark in-progress</Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(t.id, "resolved")} className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-7 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><LifeBuoy className="h-5 w-5 text-saffron" /> New support ticket</DialogTitle>
            <DialogDescription>Apni problem describe karein. Hum 24 ghante mein reply karte hain.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3.5 mt-2">
            <div className="space-y-1.5">
              <Label>Subject *</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Payment not reflecting" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="feature_request">Feature Request</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Message *</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Apni problem detail mein likhein…" rows={4} className="resize-none" />
            </div>
            <Button onClick={handleCreate} disabled={creating} className="w-full gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand">
              {creating ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <><Send className="h-4 w-4" /> Submit ticket</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* detail/reply dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
            <DialogDescription>
              {selected && new Date(selected.createdAt).toLocaleString("en-PK", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 mt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", (CATEGORY_META[selected.category] || CATEGORY_META.other).color)}>
                  {selected.category}
                </span>
                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", (STATUS_META[selected.status] || STATUS_META.open).color)}>
                  {selected.status}
                </span>
              </div>
              <div className="rounded-lg bg-[#fafafa] border border-[#e5e5e5] p-3">
                <p className="text-sm text-[#14213d] leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
              {selected.reply && (
                <div className="rounded-lg bg-[#fff5e6] border border-saffron/20 p-3">
                  <div className="text-xs font-semibold text-[#b07300] mb-1 flex items-center gap-1">
                    <Reply className="h-3.5 w-3.5" /> Admin reply
                  </div>
                  <p className="text-sm text-[#14213d]">{selected.reply}</p>
                </div>
              )}
              {isAdmin && (
                <div className="space-y-2">
                  <Label>Reply (admin)</Label>
                  <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply likhein…" rows={3} className="resize-none" />
                  <Button onClick={handleReply} disabled={!reply.trim()} className="w-full gradient-saffron text-[#14213d] font-semibold h-9">
                    <Reply className="h-4 w-4" /> Send reply
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
