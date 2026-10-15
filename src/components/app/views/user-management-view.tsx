"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
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
  Users,
  Search,
  MoreVertical,
  Shield,
  Crown,
  Eye,
  Pencil,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useApp } from "@/store/app-store";
import { ROLE_META } from "@/lib/permissions";
import { cn } from "@/lib/utils";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  businessName: string | null;
  plan: string;
  role: string;
  postCount: number;
  createdAt: string;
}

export function UserManagementView() {
  const me = useApp((s) => s.user);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setUsers(data.users || []);
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(id: string, role?: string, plan?: string) {
    setUpdating(id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, role, plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(users.map((u) => (u.id === id ? { ...u, role: data.user.role, plan: data.user.plan } : u)));
      toast.success("User update ho gaya");
    } catch (e: any) {
      toast.error(e.message || "Update fail");
    } finally {
      setUpdating(null);
    }
  }

  const filtered = users.filter((u) =>
    !search || u.email.toLowerCase().includes(search.toLowerCase()) || (u.name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-2">
        {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-[#f4f4f5] shimmer" />)}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-5xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-[#14213d] flex items-center gap-2">
          <Users className="h-5 w-5 text-saffron" /> User Management
        </h2>
        <p className="text-sm text-[#6b6b73] mt-1">Saare users dekhein, roles aur plans manage karein.</p>
      </div>

      {/* search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b73]" />
        <Input
          placeholder="Email ya naam search karein…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* users list */}
      <Card className="border-[#e5e5e5] divide-y divide-[#e5e5e5]">
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <AlertCircle className="h-10 w-10 mx-auto text-[#6b6b73]/40 mb-2" />
            <p className="text-sm text-[#6b6b73]">Koi user nahi mila</p>
          </div>
        ) : (
          filtered.map((u) => {
            const roleMeta = ROLE_META[u.role as keyof typeof ROLE_META] || ROLE_META.viewer;
            const isMe = u.id === me?.id;
            return (
              <div key={u.id} className="flex items-center gap-3 p-4 hover:bg-[#fafafa] transition-colors">
                <Avatar className="h-10 w-10 border-2" style={{ borderColor: roleMeta.color + "40" }}>
                  <AvatarFallback className="text-white text-sm font-bold" style={{ backgroundColor: roleMeta.color }}>
                    {(u.name || u.email).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[#14213d]">{u.name || "Unnamed"}</span>
                    {isMe && <Badge className="bg-saffron/15 text-[#b07300] border-0 text-[10px]">You</Badge>}
                    {u.role === "owner" && <Crown className="h-3.5 w-3.5 text-saffron" />}
                  </div>
                  <div className="text-xs text-[#6b6b73] truncate">{u.email}</div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-[#6b6b73]">
                    <span>{u.postCount} posts</span>
                    <span>·</span>
                    <span>joined {new Date(u.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className="capitalize border-0" style={{ backgroundColor: roleMeta.color + "20", color: roleMeta.color }}>
                    {u.role}
                  </Badge>
                  <Badge variant="outline" className="capitalize border-[#e5e5e5] text-[#6b6b73]">{u.plan}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button disabled={updating === u.id} className="grid place-items-center h-8 w-8 rounded-lg hover:bg-white">
                        {updating === u.id ? <Loader2 className="h-4 w-4 animate-spin text-[#6b6b73]" /> : <MoreVertical className="h-4 w-4 text-[#6b6b73]" />}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="px-2 py-1.5 text-[10px] uppercase font-bold text-[#6b6b73]">Set role</div>
                      <DropdownMenuItem onClick={() => updateUser(u.id, "admin")}>
                        <Shield className="h-4 w-4" /> Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateUser(u.id, "editor")}>
                        <Pencil className="h-4 w-4" /> Editor
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateUser(u.id, "viewer")}>
                        <Eye className="h-4 w-4" /> Viewer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5 text-[10px] uppercase font-bold text-[#6b6b73]">Set plan</div>
                      <DropdownMenuItem onClick={() => updateUser(u.id, undefined, "free")}>Free</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateUser(u.id, undefined, "pro")}>Pro</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateUser(u.id, undefined, "agency")}>Agency</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}
