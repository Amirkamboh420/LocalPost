"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Heart,
  MessageCircle,
  Eye,
  Share2,
  Bookmark,
  Pencil,
  RotateCcw,
  Trash2,
  Clock,
  TrendingUp,
  Copy,
  Repeat2,
  BarChart3,
  MessageCircle as WhatsappIcon,
  ExternalLink,
  FlaskConical,
} from "lucide-react";
import { useApp } from "@/store/app-store";
import { PlatformBadge, StatusBadge, PostThumb } from "@/components/app/shared";
import { RecurringDialog } from "@/components/app/recurring-dialog";
import { PostAnalyticsDialog } from "@/components/app/post-analytics-dialog";
import { ABSuggestionsDialog } from "@/components/app/ab-suggestions-dialog";

export function PostDetailDialog() {
  const detailPostId = useApp((s) => s.detailPostId);
  const closeDetail = useApp((s) => s.closeDetail);
  const posts = useApp((s) => s.posts);
  const openComposer = useApp((s) => s.openComposer);
  const removePost = useApp((s) => s.removePost);
  const upsertPost = useApp((s) => s.upsertPost);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [abOpen, setAbOpen] = useState(false);
  // persist post id for child dialogs even if the parent detail closes
  const [abPostId, setAbPostId] = useState<string | null>(null);
  const [analyticsPostId, setAnalyticsPostId] = useState<string | null>(null);
  const [recurringPost, setRecurringPost] = useState<{ id: string; caption: string; scheduledAt: string | null } | null>(null);

  const post = posts.find((p) => p.id === detailPostId) || null;

  async function handleRetry() {
    if (!post) return;
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      upsertPost(data.post);
      toast.success("Post retry successful — publish ho gaya!");
      closeDetail();
    } catch (e: any) {
      toast.error(e.message || "Retry fail");
    }
  }

  async function handleDelete() {
    if (!post) return;
    if (!confirm("Yeh post delete karein?")) return;
    try {
      await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      removePost(post.id);
      toast.success("Post delete ho gaya");
      closeDetail();
    } catch {
      toast.error("Delete fail");
    }
  }

  async function handleDuplicate() {
    if (!post) return;
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: post.caption,
          mediaUrls: post.mediaUrls,
          mediaType: post.mediaType,
          hashtags: post.hashtags,
          accountId: post.accountId,
          scheduledAt: null,
          status: "draft",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      upsertPost(data.post);
      toast.success("Post duplicate ho gayi — draft mein save hui");
      closeDetail();
    } catch (e: any) {
      toast.error(e.message || "Duplicate fail");
    }
  }

  function handleWhatsAppShare() {
    if (!post) return;
    const text = `${post.caption}\n\n${post.hashtags.map((h) => "#" + h).join(" ")}`.trim();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("WhatsApp pe share ho raha hai…");
  }

  return (
    <>
    <Dialog open={!!post} onOpenChange={(o) => !o && closeDetail()} modal={false}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden" aria-describedby={undefined} onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={() => closeDetail()}>
        <span className="sr-only">Post details dialog</span>
        {post && (
          <>
            {post.mediaUrls?.[0] && (
              <div className="relative h-56 w-full bg-[#14213d]">
                <img src={post.mediaUrls[0]} alt="" className="h-full w-full object-cover" />
                {post.mediaUrls.length > 1 && (
                  <span className="absolute top-2 right-2 rounded bg-black/60 text-white text-xs px-2 py-0.5">
                    1 / {post.mediaUrls.length}
                  </span>
                )}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  {post.account && <PlatformBadge platform={post.account.platform} />}
                  <StatusBadge status={post.status} />
                </div>
              </div>
            )}
            <div className="p-5">
              <DialogHeader className="p-0 space-y-0">
                <DialogTitle className="text-base font-bold text-[#14213d] flex items-center gap-2">
                  {post.mediaUrls[0] ? "" : <StatusBadge status={post.status} />}
                  Post details
                </DialogTitle>
              </DialogHeader>

              <p className="mt-3 text-sm text-[#14213d] leading-relaxed whitespace-pre-wrap">
                {post.caption}
              </p>

              {post.hashtags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {post.hashtags.map((t) => (
                    <span key={t} className="text-xs text-saffron font-medium">#{t}</span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center gap-3 text-xs text-[#6b6b73]">
                {post.scheduledAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(post.scheduledAt).toLocaleString("en-PK", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                )}
                {post.publishedAt && (
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Published {new Date(post.publishedAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                  </span>
                )}
              </div>

              {post.metrics && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <MetricBox icon={Heart} label="Likes" value={post.metrics.likes} color="#e5484d" />
                  <MetricBox icon={MessageCircle} label="Comments" value={post.metrics.comments} color="#1877f2" />
                  <MetricBox icon={Share2} label="Shares" value={post.metrics.shares} color="#10b981" />
                  <MetricBox icon={Eye} label="Reach" value={fmt(post.metrics.reach)} color="#fca311" />
                  <MetricBox icon={Bookmark} label="Saves" value={post.metrics.saves} color="#14213d" />
                  <MetricBox icon={TrendingUp} label="Impressions" value={fmt(post.metrics.impressions)} color="#6b6b73" />
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    closeDetail();
                    openComposer(post.id);
                  }}
                  className="gradient-saffron text-[#14213d] font-semibold hover:opacity-90"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                {post.status === "failed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRetry}
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Retry publish
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDuplicate}
                  className="border-[#e5e5e5] text-[#14213d] hover:bg-[#fafafa]"
                >
                  <Copy className="h-3.5 w-3.5" /> Duplicate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setRecurringPost({ id: post.id, caption: post.caption, scheduledAt: post.scheduledAt }); setRecurringOpen(true); }}
                  className="border-saffron/40 text-saffron hover:bg-[#fff5e6]"
                >
                  <Repeat2 className="h-3.5 w-3.5" /> Repeat
                </Button>
                {post.status === "published" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setAnalyticsPostId(post.id); setAnalyticsOpen(true); }}
                    className="border-[#e5e5e5] text-[#14213d] hover:bg-[#fafafa]"
                  >
                    <BarChart3 className="h-3.5 w-3.5" /> Analytics
                  </Button>
                )}
                {post.status === "published" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setAbPostId(post.id); setAbOpen(true); }}
                    className="border-saffron/40 text-saffron hover:bg-[#fff5e6]"
                  >
                    <FlaskConical className="h-3.5 w-3.5" /> A/B Ideas
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleWhatsAppShare}
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  <WhatsappIcon className="h-3.5 w-3.5" /> WhatsApp
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 ml-auto"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
      {recurringPost && (
        <RecurringDialog
          open={recurringOpen}
          onOpenChange={setRecurringOpen}
          basePostId={recurringPost.id}
          caption={recurringPost.caption}
          scheduledAt={recurringPost.scheduledAt}
          onCreated={(createdPosts) => {
            createdPosts.forEach((p) => upsertPost(p));
            closeDetail();
          }}
        />
      )}
      {analyticsPostId && (
        <PostAnalyticsDialog
          open={analyticsOpen}
          onOpenChange={setAnalyticsOpen}
          postId={analyticsPostId}
        />
      )}
      {abPostId && (
        <ABSuggestionsDialog
          open={abOpen}
          onOpenChange={setAbOpen}
          postId={abPostId}
        />
      )}
    </>
  );
}

function MetricBox({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-lg border border-[#e5e5e5] p-2.5 text-center">
      <Icon className="h-4 w-4 mx-auto mb-1" style={{ color }} />
      <div className="text-sm font-bold text-[#14213d]">{value}</div>
      <div className="text-[10px] text-[#6b6b73] uppercase">{label}</div>
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}
