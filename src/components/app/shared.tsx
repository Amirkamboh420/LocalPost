"use client";

import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react";
import type { Platform, Post } from "@/lib/types";
import { PLATFORM_META } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function PlatformIcon({
  platform,
  className,
}: {
  platform: Platform;
  className?: string;
}) {
  const props = { className: cn("h-4 w-4", className) };
  if (platform === "instagram") return <Instagram {...props} />;
  if (platform === "facebook") return <Facebook {...props} />;
  if (platform === "twitter") return <Twitter {...props} />;
  if (platform === "linkedin") return <Linkedin {...props} />;
  return <Instagram {...props} />;
}

export function PlatformBadge({ platform }: { platform: Platform }) {
  const meta = PLATFORM_META[platform];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: meta.bg, color: meta.color }}
    >
      <PlatformIcon platform={platform} className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: Post["status"] }) {
  const map: Record<Post["status"], { label: string; cls: string }> = {
    draft: { label: "Draft", cls: "bg-[#f4f4f5] text-[#6b6b73]" },
    scheduled: { label: "Scheduled", cls: "bg-[#fff5e6] text-[#b07300]" },
    publishing: { label: "Publishing", cls: "bg-blue-50 text-blue-600" },
    published: { label: "Published", cls: "bg-emerald-50 text-emerald-600" },
    failed: { label: "Failed", cls: "bg-red-50 text-red-600" },
  };
  const m = map[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", m.cls)}>
      {m.label}
    </span>
  );
}

export function PostThumb({
  post,
  className,
}: {
  post: Pick<Post, "mediaUrls" | "caption" | "mediaType">;
  className?: string;
}) {
  const url = post.mediaUrls?.[0];
  if (url) {
    return (
      <div className={cn("relative overflow-hidden rounded-lg bg-[#f4f4f5]", className)}>
        <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
        {post.mediaType === "carousel" && post.mediaUrls.length > 1 && (
          <span className="absolute top-1.5 right-1.5 rounded bg-black/60 text-white text-[10px] px-1.5 py-0.5">
            +{post.mediaUrls.length}
          </span>
        )}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "grid place-items-center rounded-lg bg-gradient-to-br from-[#14213d] to-[#1c2d52] text-white/30",
        className
      )}
    >
      <span className="text-[10px]">No media</span>
    </div>
  );
}

export function MiniStat({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon?: any;
}) {
  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-[#6b6b73] font-medium">
          {label}
        </span>
        {Icon && (
          <div className="grid place-items-center h-7 w-7 rounded-lg bg-[#fff5e6]">
            <Icon className="h-3.5 w-3.5 text-saffron" />
          </div>
        )}
      </div>
      <div className="mt-2 text-2xl font-extrabold text-[#14213d]">{value}</div>
      {delta && <div className="mt-0.5 text-xs text-emerald-600 font-medium">{delta}</div>}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  desc,
  action,
}: {
  icon: any;
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="grid place-items-center h-16 w-16 rounded-2xl bg-[#fff5e6] mb-4">
        <Icon className="h-8 w-8 text-saffron" />
      </div>
      <h3 className="text-lg font-bold text-[#14213d]">{title}</h3>
      <p className="mt-1.5 text-sm text-[#6b6b73] max-w-sm">{desc}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
