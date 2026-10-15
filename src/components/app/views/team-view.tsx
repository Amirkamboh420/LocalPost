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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  UserPlus,
  Users,
  MoreVertical,
  Trash2,
  Shield,
  Pencil,
  Mail,
  CheckCircle2,
  Clock,
  Crown,
  Loader2,
} from "lucide-react";
import { EmptyState } from "@/components/app/shared";
import type { TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLE_META: Record<string, { label: string; desc: string; color: string }> = {
  admin: { label: "Admin", desc: "Sab kuch manage kar sakte hain", color: "bg-red-50 text-red-600" },
  editor: { label: "Editor", desc: "Posts banayein/edit karein", color: "bg-saffron/15 text-[#b07300]" },
  viewer: { label: "Viewer", desc: "Sirf dekh sakte hain", color: "bg-blue-50 text-blue-600" },
};

export function TeamView() {
  const user = useApp((s) => s.user);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "editor" | "viewer">("editor");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/team", { cache: "no-store" });
      const data = await res.json();
      setMembers(data.members || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite() {
    if (!email.trim() || !name.trim()) {
      toast.error("Email aur naam zaroori hain");
      return;
    }
    setInviting(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMembers([...members, data.member]);
      toast.success(`${name} ko invite bhej diya gaya!`);
      setInviteOpen(false);
      setEmail("");
      setName("");
      setRole("editor");
    } catch (e: any) {
      toast.error(e.message || "Invite fail");
    } finally {
      setInviting(false);
    }
  }

  async function updateRole(id: string, newRole: "admin" | "editor" | "viewer") {
    try {
      const res = await fetch(`/api/team/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Update fail");
      setMembers(members.map((m) => (m.id === id ? { ...m, role: newRole } : m)));
      toast.success("Role update ho gaya");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function removeMember(id: string, memberName: string) {
    if (!confirm(`${memberName} ko remove karein?`)) return;
    try {
      await fetch(`/api/team/${id}`, { method: "DELETE" });
      setMembers(members.filter((m) => m.id !== id));
      toast.success("Member remove ho gaya");
    } catch {
      toast.error("Remove fail");
    }
  }

  const activeCount = members.length;
  const plan = user?.plan || "free";
  const limit = plan === "agency" ? 10 : plan === "pro" ? 3 : 0;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-5xl mx-auto">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#14213d] flex items-center gap-2">
            <Users className="h-5 w-5 text-saffron" /> Team members
          </h2>
          <p className="text-sm text-[#6b6b73] mt-1">
            Apni team manage karein. Roles assign karein, invite bhejein.
          </p>
        </div>
        <Button
          onClick={() => setInviteOpen(true)}
          disabled={limit === 0 || activeCount >= limit}
          className="gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand"
        >
          <UserPlus className="h-4 w-4" /> Invite member
        </Button>
      </div>

      {/* plan limit banner */}
      <Card className={cn(
        "border p-4",
        plan === "free"
          ? "border-saffron/30 bg-[#fffdf8]"
          : "border-[#e5e5e5]"
      )}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "grid place-items-center h-10 w-10 rounded-lg",
              plan === "free" ? "bg-saffron/20" : "bg-[#14213d]"
            )}>
              <Shield className={cn("h-5 w-5", plan === "free" ? "text-saffron" : "text-saffron")} />
            </div>
            <div>
              <div className="text-sm font-bold text-[#14213d]">
                {plan === "free"
                  ? "Team features Pro plan se shuru hote hain"
                  : `${activeCount} / ${limit} members used`}
              </div>
              <div className="text-xs text-[#6b6b73] capitalize">
                {plan} plan · {plan === "agency" ? "10 seats included" : plan === "pro" ? "3 seats included" : "Upgrade for team access"}
              </div>
            </div>
          </div>
          {plan !== "agency" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => useApp.getState().setView("billing")}
              className="border-saffron/40 text-saffron hover:bg-[#fff5e6]"
            >
              Upgrade
            </Button>
          )}
        </div>
      </Card>

      {/* members list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-[#f4f4f5] shimmer" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <Card className="border-dashed border-[#e5e5e5]">
          <EmptyState
            icon={Users}
            title="Abhi koi team member nahi"
            desc="Pro ya Agency plan mein team members invite karein. Roles assign karke collaboration enable karein."
            action={
              plan !== "free" ? (
                <Button onClick={() => setInviteOpen(true)} className="gradient-saffron text-[#14213d] font-semibold">
                  <UserPlus className="h-4 w-4" /> Pehla invite bhejein
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <Card className="border-[#e5e5e5] divide-y divide-[#e5e5e5]">
          {members.map((m) => {
            const roleMeta = ROLE_META[m.role];
            return (
              <div key={m.id} className="flex items-center gap-3 p-4 hover:bg-[#fafafa] transition-colors group">
                <Avatar className="h-10 w-10 border-2" style={{ borderColor: m.avatarColor + "40" }}>
                  <AvatarFallback
                    className="text-white text-sm font-bold"
                    style={{ backgroundColor: m.avatarColor }}
                  >
                    {m.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[#14213d]">{m.name}</span>
                    {m.isOwner && (
                      <Badge className="bg-saffron/15 text-[#b07300] border-0 text-[10px]">
                        <Crown className="h-3 w-3 mr-1" /> Owner
                      </Badge>
                    )}
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", roleMeta.color)}>
                      {roleMeta.label}
                    </span>
                  </div>
                  <div className="text-xs text-[#6b6b73] truncate">{m.email}</div>
                  <div className="text-[10px] text-[#6b6b73] mt-0.5">
                    {m.status === "invited" ? (
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Invite pending</span>
                    ) : (
                      <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Active</span>
                    )}
                  </div>
                </div>
                {!m.isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="grid place-items-center h-8 w-8 rounded-lg hover:bg-white opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical className="h-4 w-4 text-[#6b6b73]" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => updateRole(m.id, "admin")}>
                        <Shield className="h-4 w-4" /> Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateRole(m.id, "editor")}>
                        <Pencil className="h-4 w-4" /> Make Editor
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateRole(m.id, "viewer")}>
                        <Users className="h-4 w-4" /> Make Viewer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => removeMember(m.id, m.name)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </Card>
      )}

      {/* role legend */}
      <div className="grid sm:grid-cols-3 gap-3">
        {Object.entries(ROLE_META).map(([key, meta]) => (
          <Card key={key} className="border-[#e5e5e5] p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", meta.color)}>
                {meta.label}
              </span>
            </div>
            <p className="text-xs text-[#6b6b73]">{meta.desc}</p>
          </Card>
        ))}
      </div>

      {/* invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-saffron" /> Team member invite karein
            </DialogTitle>
            <DialogDescription>
              Email aur naam daalein. Role assign karein. Invite email bhej diya jayega.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3.5 mt-2">
            <div className="space-y-1.5">
              <Label>Naam</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Member ka naam" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b73]" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="member@business.pk"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin — sab kuch manage</SelectItem>
                  <SelectItem value="editor">Editor — posts banayein/edit</SelectItem>
                  <SelectItem value="viewer">Viewer — sirf dekhe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg bg-[#fff5e6] p-3 text-xs text-[#6b6b73]">
              💡 {activeCount} / {limit} seats used. Invite accept hone par member active ho jayega.
            </div>
            <Button
              onClick={handleInvite}
              disabled={inviting}
              className="w-full gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand"
            >
              {inviting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Bhej rahe hain…</>
              ) : (
                <><Mail className="h-4 w-4" /> Invite bhejein</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
