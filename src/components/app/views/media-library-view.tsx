"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/store/app-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  Search,
  Loader2,
  Copy,
  ExternalLink,
  X,
} from "lucide-react";
import { EmptyState } from "@/components/app/shared";
import type { MediaItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MediaLibraryView() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "post" | "library">("all");
  const [selected, setSelected] = useState<MediaItem | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/media", { cache: "no-store" });
      const data = await res.json();
      setMedia(data.media || []);
    } finally {
      setLoading(false);
    }
  }

  const filtered = media.filter((m) => {
    if (filter !== "all" && m.source !== filter) return false;
    if (search && !m.caption.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-[#14213d] flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-saffron" /> Media library
        </h2>
        <p className="text-sm text-[#6b6b73] mt-1">
          Saari images jo aap ne posts ya library mein add ki hain. Reuse karne ke liye.
        </p>
      </div>

      {/* toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b73]" />
          <Input
            placeholder="Captions search karein…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex rounded-lg border border-[#e5e5e5] p-0.5 bg-white">
          {(["all", "post", "library"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors",
                filter === f ? "gradient-saffron text-[#14213d]" : "text-[#6b6b73] hover:bg-[#fafafa]"
              )}
            >
              {f === "all" ? "All" : f === "post" ? "From posts" : "Library"}
            </button>
          ))}
        </div>
      </div>

      {/* grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-[#f4f4f5] shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-[#e5e5e5]">
          <EmptyState
            icon={ImageIcon}
            title="Koi media nahi mila"
            desc="Composer mein images upload karein ya posts mein media add karein — woh yahan library mein dikhega."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((m, i) => (
            <Card
              key={i}
              className="border-[#e5e5e5] overflow-hidden hover:shadow-navy hover:-translate-y-0.5 transition-all group cursor-pointer"
            >
              <button
                onClick={() => setSelected(m)}
                className="block w-full aspect-square bg-[#f4f4f5] overflow-hidden"
              >
                <img src={m.url} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              </button>
              <div className="p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className={cn(
                    "text-[9px] border-0",
                    m.source === "post" ? "bg-saffron/15 text-[#b07300]" : "bg-blue-50 text-blue-600"
                  )}>
                    {m.source === "post" ? "Post" : "Library"}
                  </Badge>
                  <span className="text-[9px] text-[#6b6b73]">
                    {new Date(m.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <p className="text-[11px] text-[#6b6b73] line-clamp-1">{m.caption}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* preview dialog */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4"
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 z-10 grid place-items-center h-9 w-9 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="grid sm:grid-cols-[2fr_1fr]">
              <div className="bg-[#14213d] aspect-square sm:aspect-auto">
                <img src={selected.url} alt="" className="h-full w-full object-contain" />
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-[#6b6b73] font-semibold">Source</div>
                  <Badge className={cn("border-0 mt-1", selected.source === "post" ? "bg-saffron/15 text-[#b07300]" : "bg-blue-50 text-blue-600")}>
                    {selected.source === "post" ? "From a post" : "Content library"}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-[#6b6b73] font-semibold">Caption</div>
                  <p className="text-sm text-[#14213d] mt-1 leading-relaxed line-clamp-4">{selected.caption}</p>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-[#6b6b73] font-semibold">Added</div>
                  <p className="text-sm text-[#14213d] mt-1">{new Date(selected.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(selected.url);
                      toast.success("URL copy ho gaya");
                    }}
                    className="flex-1 gradient-saffron text-[#14213d] font-semibold h-9"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy URL
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(selected.url, "_blank")}
                    className="border-[#e5e5e5] text-[#14213d] h-9"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
