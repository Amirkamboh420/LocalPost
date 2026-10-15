"use client";

import { useState } from "react";
import { useApp } from "@/store/app-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  CheckSquare,
  Check,
  X,
  Clock,
  Pencil,
  Inbox,
  Users,
} from "lucide-react";
import { PlatformBadge, StatusBadge, PostThumb, EmptyState } from "@/components/app/shared";

const TEAM = [
  { name: "Ayesha Khan", role: "Admin", avatar: "https://i.pravatar.cc/100?img=47", color: "bg-saffron" },
  { name: "Bilal Ahmed", role: "Editor", avatar: "https://i.pravatar.cc/100?img=12", color: "bg-[#14213d]" },
  { name: "Sana Malik", role: "Editor", avatar: "https://i.pravatar.cc/100?img=32", color: "bg-[#14213d]" },
  { name: "Hassan Raza", role: "Viewer", avatar: "https://i.pravatar.cc/100?img=15", color: "bg-[#6b6b73]" },
];

export function ApprovalsView() {
  const posts = useApp((s) => s.posts);
  const upsertPost = useApp((s) => s.upsertPost);
  const openComposer = useApp((s) => s.openComposer);
  const [pending, setPending] = useState<string[]>([]);

  // drafts + scheduled treated as approval queue (demo)
  const queue = posts.filter((p) => p.status === "draft" || (pending.includes(p.id) && p.status === "scheduled"));

  async function approve(id: string) {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      upsertPost(data.post);
      toast.success("Post approve ho gaya aur publish ho gaya! 🎉");
    } catch (e: any) {
      toast.error(e.message || "Approve fail");
    }
  }

  function requestChanges(id: string) {
    setPending([...pending, id]);
    toast.info("Editor ko changes ke liye bhej diya");
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#14213d]">Approval queue</h2>
          <p className="text-sm text-[#6b6b73]">
            Team ke posts review aur approve karein before publishing.
          </p>
        </div>
        <Button onClick={() => openComposer()} className="gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand">
          <Pencil className="h-4 w-4" /> New post
        </Button>
      </div>

      {/* team strip */}
      <Card className="border-[#e5e5e5] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#14213d] flex items-center gap-2">
            <Users className="h-4 w-4 text-saffron" />
            Team members
          </h3>
          <Button variant="outline" size="sm" className="border-[#e5e5e5] text-[#14213d]">Invite member</Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {TEAM.map((m) => (
            <div key={m.name} className="flex items-center gap-2.5 rounded-lg border border-[#e5e5e5] px-3 py-2">
              <Avatar className="h-8 w-8">
                <img src={m.avatar} alt={m.name} />
                <AvatarFallback className={m.color + " text-white text-xs font-bold"}>
                  {m.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-xs font-semibold text-[#14213d]">{m.name}</div>
                <div className="text-[10px] text-[#6b6b73]">{m.role}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* queue */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#14213d]">
            Pending approval ({queue.length})
          </h3>
        </div>

        {queue.length === 0 ? (
          <Card className="border-dashed border-[#e5e5e5]">
            <EmptyState
              icon={Inbox}
              title="Queue khali hai"
              desc="Draft posts yahan aayenge approve hone ke liye. Team workflow ke liye Agency plan upgrade karein."
              action={
                <Button onClick={() => openComposer()} className="gradient-saffron text-[#14213d] font-semibold">
                  <Pencil className="h-4 w-4" /> Draft banayein
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {queue.map((p) => (
              <Card key={p.id} className="border-[#e5e5e5] overflow-hidden hover:shadow-navy transition-shadow">
                <div className="flex flex-col sm:flex-row">
                  <PostThumb post={p} className="h-full sm:w-32 sm:h-auto aspect-square sm:aspect-auto shrink-0" />
                  <div className="flex-1 p-4">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {p.account && <PlatformBadge platform={p.account.platform} />}
                      <StatusBadge status={p.status} />
                      <Badge variant="outline" className="border-saffron/30 text-[#b07300] text-[10px]">
                        <Clock className="h-3 w-3 mr-1" /> Pending review
                      </Badge>
                    </div>
                    <p className="text-sm text-[#14213d] leading-relaxed line-clamp-2">{p.caption}</p>
                    {p.hashtags.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {p.hashtags.slice(0, 4).map((t) => (
                          <span key={t} className="text-xs text-saffron">#{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        onClick={() => approve(p.id)}
                        className="gradient-saffron text-[#14213d] font-semibold hover:opacity-90 h-8"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve & publish
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => requestChanges(p.id)}
                        className="border-[#e5e5e5] h-8 text-[#14213d]"
                      >
                        <X className="h-3.5 w-3.5" /> Request changes
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openComposer(p.id)}
                        className="h-8 text-[#6b6b73]"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <span className="ml-auto text-xs text-[#6b6b73] hidden sm:flex items-center gap-1">
                        <CheckSquare className="h-3 w-3" /> By {TEAM[1].name}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* info */}
      <div className="rounded-xl border border-saffron/30 bg-[#fffdf8] p-4 flex items-start gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-lg bg-saffron/20 shrink-0">
          <CheckSquare className="h-5 w-5 text-saffron" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#14213d]">Approval workflow</h4>
          <p className="text-xs text-[#6b6b73] mt-0.5">
            Agency plan mein team members roles ke saath add karein (Admin/Editor/Viewer). Editors post banayein, Admin approve karein. White-label option bhi available.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 border-saffron/40 text-saffron hover:bg-[#fff5e6] h-7"
            onClick={() => useApp.getState().setView("billing")}
          >
            Agency plan dekhein
          </Button>
        </div>
      </div>
    </div>
  );
}
