"use client";

import { useState } from "react";
import { useApp } from "@/store/app-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Lightbulb,
  Sparkles,
  Loader2,
  Pencil,
  Copy,
  Image as ImageIcon,
  Layers,
  Film,
  Bookmark,
  Calendar,
} from "lucide-react";
import { EmptyState } from "@/components/app/shared";
import { cn } from "@/lib/utils";

const TYPE_META: Record<string, { label: string; icon: any; color: string }> = {
  image: { label: "Image", icon: ImageIcon, color: "bg-saffron/15 text-[#b07300]" },
  carousel: { label: "Carousel", icon: Layers, color: "bg-blue-50 text-blue-600" },
  reel: { label: "Reel", icon: Film, color: "bg-red-50 text-red-600" },
  story: { label: "Story", icon: Bookmark, color: "bg-purple-50 text-purple-600" },
};

const NICHE_PRESETS = [
  "Boutique / Fashion",
  "Restaurant / Food",
  "Beauty / Salon",
  "Electronics / Mobiles",
  "Home Decor",
  "Fitness / Gym",
];

export function ContentIdeasView() {
  const user = useApp((s) => s.user);
  const openComposer = useApp((s) => s.openComposer);
  const upsertPost = useApp((s) => s.upsertPost);
  const [niche, setNiche] = useState("");
  const [business, setBusiness] = useState(user?.businessName || "");
  const [season, setSeason] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    ideas: { title: string; angle: string; captionHint: string; suggestedType: string; bestDay: string }[];
    contentPillars: string[];
    weeklyTip: string;
  } | null>(null);

  async function generate() {
    if (!niche.trim()) {
      toast.error("Business niche likhein");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/content-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, business, season }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      toast.success(`${data.ideas?.length || 0} content ideas ready!`);
    } catch (e: any) {
      toast.error(e.message || "Ideas generate nahi hue");
    } finally {
      setLoading(false);
    }
  }

  async function applyIdea(idea: { title: string; captionHint: string; suggestedType: string }) {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: `${idea.title}\n\n${idea.captionHint}`,
          mediaUrls: [],
          mediaType: idea.suggestedType === "carousel" ? "carousel" : "image",
          hashtags: [],
          accountId: null,
          scheduledAt: null,
          status: "draft",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      upsertPost(data.post);
      toast.success("Idea post mein add hua — edit karke use karein");
      openComposer(data.post.id);
    } catch (e: any) {
      toast.error(e.message || "Use fail");
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-5xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-[#14213d] flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-saffron" /> AI content ideas
        </h2>
        <p className="text-sm text-[#6b6b73] mt-1">
          Apne business ke liye 10 actionable content ideas generate karein. Roman Urdu + English, season-aware.
        </p>
      </div>

      {/* input card */}
      <Card className="border-saffron/30 bg-[#fffdf8]">
        <CardContent className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-[#6b6b73]">Business naam</Label>
              <Input
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                placeholder="e.g. Urban Boutique"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-[#6b6b73]">Current season/context</Label>
              <Input
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                placeholder="e.g. Eid season, winter, Ramzan"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase text-[#6b6b73]">Business niche *</Label>
            <Textarea
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. Online boutique selling women's lawn suits in Karachi, target audience 18-35"
              rows={2}
              className="resize-none"
            />
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className="text-[10px] text-[#6b6b73] mr-1">Quick:</span>
              {NICHE_PRESETS.map((n) => (
                <button
                  key={n}
                  onClick={() => setNiche(n)}
                  className="text-[11px] rounded-full bg-white border border-[#e5e5e5] px-2 py-0.5 text-[#6b6b73] hover:border-saffron hover:text-saffron transition-colors"
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={generate}
            disabled={loading || !niche.trim()}
            className="w-full gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Ideas generate ho rahe hain…</>
            ) : (
              <><Sparkles className="h-4 w-4" /> 10 content ideas generate karein</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* result */}
      {result && (
        <div className="space-y-4">
          {/* weekly tip */}
          {result.weeklyTip && (
            <div className="rounded-xl border border-saffron/30 bg-[#fff5e6] p-4 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-saffron shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-[#b07300] uppercase tracking-wide">Weekly tip</div>
                <p className="text-sm text-[#14213d] mt-0.5">{result.weeklyTip}</p>
              </div>
            </div>
          )}

          {/* content pillars */}
          {result.contentPillars?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#6b6b73]">Content pillars:</span>
              {result.contentPillars.map((p, i) => (
                <Badge key={i} variant="outline" className="border-saffron/40 text-[#b07300] bg-[#fffdf8]">
                  {p}
                </Badge>
              ))}
            </div>
          )}

          {/* ideas grid */}
          {result.ideas?.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {result.ideas.map((idea, i) => {
                const meta = TYPE_META[idea.suggestedType] || TYPE_META.image;
                return (
                  <Card key={i} className="border-[#e5e5e5] p-4 hover:shadow-navy hover:-translate-y-0.5 transition-all group flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="grid place-items-center h-6 w-6 rounded-full gradient-saffron text-[#14213d] text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", meta.color)}>
                          <meta.icon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      </div>
                      {idea.bestDay && (
                        <span className="flex items-center gap-1 text-[10px] text-[#6b6b73]">
                          <Calendar className="h-3 w-3" /> {idea.bestDay}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-[#14213d] text-sm">{idea.title}</h3>
                    <div className="text-[10px] uppercase tracking-wide text-saffron font-semibold mt-1">{idea.angle}</div>
                    <p className="text-xs text-[#6b6b73] mt-2 leading-relaxed flex-1">{idea.captionHint}</p>
                    <div className="flex gap-2 mt-3 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        onClick={() => applyIdea(idea)}
                        className="flex-1 gradient-saffron text-[#14213d] font-semibold h-8"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Use
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(`${idea.title}\n${idea.captionHint}`);
                          toast.success("Copied");
                        }}
                        className="border-[#e5e5e5] h-8"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            !loading && (
              <Card className="border-dashed border-[#e5e5e5]">
                <EmptyState
                  icon={Lightbulb}
                  title="Koi ideas generate nahi hue"
                  desc="Apna niche likhein aur generate button dabayein."
                />
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
