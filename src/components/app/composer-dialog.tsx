"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Sparkles,
  Image as ImageIcon,
  Hash,
  Calendar,
  Send,
  Save,
  Clock,
  Loader2,
  Wand2,
  X,
  Check,
  Copy,
  Eye,
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  TrendingUp,
  Plus,
  Upload,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "@/store/app-store";
import { PLATFORM_META } from "@/lib/types";
import { cn } from "@/lib/utils";

const TONES = [
  { value: "casual", label: "Casual / Friendly" },
  { value: "professional", label: "Professional" },
  { value: "promotional", label: "Promotional" },
  { value: "storytelling", label: "Storytelling" },
];

const DEMO_IMAGES = [
  "https://picsum.photos/seed/lp1/800/800",
  "https://picsum.photos/seed/lp2/800/800",
  "https://picsum.photos/seed/lp3/800/800",
  "https://picsum.photos/seed/lp4/800/800",
  "https://picsum.photos/seed/lp5/800/800",
  "https://picsum.photos/seed/lp6/800/800",
  "https://picsum.photos/seed/lp7/800/800",
  "https://picsum.photos/seed/lp8/800/800",
];

export function ComposerDialog() {
  const open = useApp((s) => s.composerOpen);
  const closeComposer = useApp((s) => s.closeComposer);
  const editingPostId = useApp((s) => s.editingPostId);
  const posts = useApp((s) => s.posts);
  const accounts = useApp((s) => s.accounts);
  const user = useApp((s) => s.user);
  const upsertPost = useApp((s) => s.upsertPost);
  const removePost = useApp((s) => s.removePost);

  const editing = posts.find((p) => p.id === editingPostId) || null;

  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<"image" | "video" | "carousel" | "text">("image");
  const [accountId, setAccountId] = useState<string>("");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [status, setStatus] = useState<"draft" | "scheduled" | "published">("draft");

  // AI
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("casual");
  const [aiLang, setAiLang] = useState<"english" | "roman-urdu" | "both">("both");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<
    { text: string; language: string }[] | null
  >(null);
  const [aiHashtags, setAiHashtags] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        setCaption(editing.caption);
        setHashtags(editing.hashtags);
        setMediaUrls(editing.mediaUrls);
        setMediaType(editing.mediaType);
        setAccountId(editing.accountId || "");
        setScheduledAt(
          editing.scheduledAt
            ? new Date(new Date(editing.scheduledAt).getTime() - new Date().getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16)
            : ""
        );
      } else {
        resetForm();
      }
      setAiResults(null);
      setAiHashtags([]);
      setAiTopic("");
    }
  }, [open, editingPostId]);

  function resetForm() {
    setCaption("");
    setHashtags([]);
    setMediaUrls([]);
    setMediaType("image");
    setAccountId(accounts[0]?.id || "");
    setScheduledAt("");
    setStatus("draft");
  }

  const selectedAccount = accounts.find((a) => a.id === accountId) || null;
  const charLimit = selectedAccount
    ? PLATFORM_META[selectedAccount.platform].charLimit
    : 2200;
  const overLimit = caption.length > charLimit;

  async function generateCaptions() {
    if (!aiTopic.trim()) {
      toast.error("Pehle topic/product likhein");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic, tone: aiTone, language: aiLang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Caption generate nahi hue");
      setAiResults(data.captions || []);
      if (data.hashtags?.length) setAiHashtags(data.hashtags);
      toast.success(`${data.captions?.length || 0} captions ready!`);
    } catch (e: any) {
      toast.error(e.message || "AI caption fail");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSave(targetStatus: "draft" | "scheduled" | "published") {
    if (!caption.trim()) {
      toast.error("Caption likhna zaroori hai");
      return;
    }
    if (targetStatus === "scheduled" && !scheduledAt) {
      toast.error("Schedule karne ke liye date/time select karein");
      return;
    }
    if (overLimit) {
      toast.error(`Caption ${charLimit} characters se lamba hai`);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        caption,
        mediaUrls,
        mediaType: mediaUrls.length > 1 ? "carousel" : mediaType,
        hashtags,
        accountId: accountId || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        status: targetStatus,
      };
      const isEdit = !!editing;
      const res = await fetch(
        isEdit ? `/api/posts/${editing!.id}` : "/api/posts",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save fail");
      upsertPost(data.post);
      toast.success(
        targetStatus === "published"
          ? "Post publish ho gaya! 🎉"
          : targetStatus === "scheduled"
          ? "Post schedule ho gaya!"
          : "Draft save ho gayi"
      );
      closeComposer();
    } catch (e: any) {
      toast.error(e.message || "Save fail");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    if (!confirm("Yeh post delete karein?")) return;
    setSaving(true);
    try {
      await fetch(`/api/posts/${editing.id}`, { method: "DELETE" });
      removePost(editing.id);
      toast.success("Post delete ho gaya");
      closeComposer();
    } catch {
      toast.error("Delete fail");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeComposer()}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-hidden p-0 flex flex-col">
        <div className="gradient-navy px-6 py-4 text-white flex items-center justify-between">
          <div>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-saffron" />
              {editing ? "Post edit karein" : "Naya post banayein"}
            </DialogTitle>
            <DialogDescription className="text-white/60 text-xs mt-0.5">
              AI captions, multi-image, schedule — sab ek jagah
            </DialogDescription>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scroll-area-brand px-6 py-5">
          <Tabs defaultValue="compose" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-[#f4f4f5] mb-5">
              <TabsTrigger value="compose" className="data-[state=active]:bg-white data-[state=active]:text-[#14213d]">
                <ImageIcon className="h-3.5 w-3.5 mr-1.5" /> Compose
              </TabsTrigger>
              <TabsTrigger value="ai" className="data-[state=active]:bg-white data-[state=active]:text-[#14213d]">
                <Wand2 className="h-3.5 w-3.5 mr-1.5" /> AI
              </TabsTrigger>
              <TabsTrigger value="hashtags" className="data-[state=active]:bg-white data-[state=active]:text-[#14213d]">
                <Hash className="h-3.5 w-3.5 mr-1.5" /> Tags
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-white data-[state=active]:text-[#14213d]">
                <Eye className="h-3.5 w-3.5 mr-1.5" /> Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-5 mt-0">
              {/* Account */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-[#6b6b73]">
                  Post karne ka account
                </Label>
                {accounts.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[#e5e5e5] p-3 text-sm text-[#6b6b73] text-center">
                    Pehle ek account connect karein (Accounts page).
                  </div>
                ) : (
                  <Select value={accountId} onValueChange={setAccountId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Account choose karein" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.displayName} · @{a.handle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Caption */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-[#6b6b73]">
                    Caption
                  </Label>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      overLimit ? "text-red-600" : "text-[#6b6b73]"
                    )}
                  >
                    {caption.length} / {charLimit}
                  </span>
                </div>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Apna caption yahan likhein… ya AI Captions tab se generate karayein ✨"
                  rows={5}
                  className="resize-none"
                />
              </div>

              {/* Hashtags */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-[#6b6b73]">
                  <Hash className="h-3 w-3 inline mr-1" /> Hashtags
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add hashtag (e.g. KarachiShopping)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const v = (e.target as HTMLInputElement).value.trim().replace(/^#/, "");
                        if (v && !hashtags.includes(v)) {
                          setHashtags([...hashtags, v]);
                        }
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                  {aiHashtags.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setHashtags([...hashtags, ...aiHashtags.map((t) => t.replace(/^#/, ""))])}
                      className="shrink-0 border-saffron/40 text-saffron hover:bg-[#fff5e6]"
                    >
                      Use AI tags
                    </Button>
                  )}
                </div>
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {hashtags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-full bg-[#fff5e6] text-[#14213d] px-2.5 py-1 text-xs font-medium"
                      >
                        #{t}
                        <button onClick={() => setHashtags(hashtags.filter((x) => x !== t))}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {aiHashtags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="text-xs text-[#6b6b73] mr-1">AI suggested:</span>
                    {aiHashtags.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          const clean = t.replace(/^#/, "");
                          if (!hashtags.includes(clean)) setHashtags([...hashtags, clean]);
                        }}
                        className="text-xs text-saffron hover:underline"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Media */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-[#6b6b73]">
                  Media ({mediaUrls.length})
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {mediaUrls.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#e5e5e5] group">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        onClick={() => setMediaUrls(mediaUrls.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 grid place-items-center h-5 w-5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {i === 0 && mediaUrls.length > 1 && (
                        <span className="absolute bottom-1 left-1 rounded bg-saffron text-[#14213d] text-[9px] px-1 font-bold">
                          COVER
                        </span>
                      )}
                    </div>
                  ))}
                  {mediaUrls.length < 8 && (
                    <button
                      onClick={() => setMediaUrls([...mediaUrls, DEMO_IMAGES[mediaUrls.length % DEMO_IMAGES.length]])}
                      className="aspect-square rounded-lg border-2 border-dashed border-[#e5e5e5] hover:border-saffron hover:bg-[#fff5e6] transition-colors grid place-items-center text-[#6b6b73]"
                    >
                      <ImageIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-xs text-[#6b6b73] mr-1">Quick add:</span>
                  {DEMO_IMAGES.slice(0, 6).map((url) => (
                    <button
                      key={url}
                      onClick={() => {
                        if (!mediaUrls.includes(url) && mediaUrls.length < 8) {
                          setMediaUrls([...mediaUrls, url]);
                        }
                      }}
                      className="h-9 w-9 rounded-md overflow-hidden border border-[#e5e5e5] hover:border-saffron transition-colors"
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
                <Input
                  placeholder="Ya image URL paste karein…"
                  className="mt-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const v = (e.target as HTMLInputElement).value.trim();
                      if (v && mediaUrls.length < 8) {
                        setMediaUrls([...mediaUrls, v]);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                />
                <FileUploadButton
                  onUploaded={(url) => {
                    if (mediaUrls.length < 8) {
                      setMediaUrls([...mediaUrls, url]);
                      toast.success("Image upload ho gayi");
                    }
                  }}
                  disabled={mediaUrls.length >= 8}
                />
              </div>

              {/* Schedule */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-[#6b6b73]">
                  <Calendar className="h-3 w-3 inline mr-1" /> Schedule date & time
                </Label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <QuickTime label="In 1 hour" minutes={60} onClick={setScheduledAt} />
                  <QuickTime label="Tomorrow 9 AM" hours={24} forceTime="09:00" onClick={setScheduledAt} />
                  <QuickTime label="Tomorrow 7 PM" hours={24} forceTime="19:00" onClick={setScheduledAt} />
                  <QuickTime label="Next Mon 9 AM" days={7} forceTime="09:00" onClick={setScheduledAt} />
                </div>
                <BestTimeSuggestions onPick={setScheduledAt} />
                <ConflictCheck
                  datetime={scheduledAt}
                  accountId={accountId}
                  excludePostId={editingPostId || undefined}
                />
              </div>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4 mt-0">
              <div className="rounded-xl border border-saffron/30 bg-[#fffdf8] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Wand2 className="h-4 w-4 text-saffron" />
                  <span className="text-sm font-bold text-[#14213d]">AI Caption Generator</span>
                  <Badge className="ml-auto bg-saffron/20 text-[#b07300] border-0">Roman Urdu + English</Badge>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#6b6b73]">
                      Topic / product description
                    </Label>
                    <Textarea
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="e.g. Winter sweater sale, 25% off, for Instagram boutique"
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-[#6b6b73]">Tone</Label>
                      <Select value={aiTone} onValueChange={setAiTone}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TONES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-[#6b6b73]">Language</Label>
                      <Select value={aiLang} onValueChange={(v) => setAiLang(v as any)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="both">English + Roman Urdu</SelectItem>
                          <SelectItem value="english">English only</SelectItem>
                          <SelectItem value="roman-urdu">Roman Urdu only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={generateCaptions}
                    disabled={aiLoading}
                    className="w-full gradient-saffron text-[#14213d] font-semibold hover:opacity-90"
                  >
                    {aiLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Captions generate ho rahe hain…</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Captions generate karein</>
                    )}
                  </Button>
                </div>
              </div>

              {aiResults && aiResults.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#6b6b73]">
                    {aiResults.length} options — click to use
                  </div>
                  {aiResults.map((c, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-[#e5e5e5] p-4 hover:border-saffron/40 hover:bg-[#fffdf8] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className={c.language === "roman-urdu" ? "bg-saffron/15 text-[#b07300]" : "bg-[#f4f4f5] text-[#6b6b73]"}>
                          {c.language === "roman-urdu" ? "Roman Urdu" : "English"}
                        </Badge>
                        <div className="flex gap-1">
                          <button
                            onClick={() => navigator.clipboard.writeText(c.text)}
                            className="grid place-items-center h-7 w-7 rounded-md hover:bg-[#fafafa] text-[#6b6b73]"
                            title="Copy"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setCaption(c.text);
                              toast.success("Caption use ho raha hai");
                            }}
                            className="gradient-saffron text-[#14213d] h-7"
                          >
                            <Check className="h-3.5 w-3.5" /> Use
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-[#14213d] leading-relaxed whitespace-pre-wrap">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="hashtags" className="space-y-4 mt-0">
              <HashGeneratorTab
                topic={caption.slice(0, 200) || ""}
                onAdd={(tags) => {
                  const merged = [...new Set([...hashtags, ...tags.map((t) => t.replace(/^#/, ""))])];
                  setHashtags(merged);
                  toast.success(`${tags.length} hashtags add ho gaye`);
                }}
                currentHashtags={hashtags}
                onRemove={(t) => setHashtags(hashtags.filter((x) => x !== t))}
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <PostPreviewTab
                caption={caption}
                mediaUrls={mediaUrls}
                account={selectedAccount}
                user={user}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer actions */}
        <div className="border-t border-[#e5e5e5] bg-[#fafafa] px-6 py-3 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
          <div className="flex gap-2">
            {editing && (
              <Button
                variant="ghost"
                onClick={handleDelete}
                disabled={saving}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => handleSave("draft")}
              disabled={saving || !caption.trim()}
              className="border-[#e5e5e5]"
            >
              <Save className="h-4 w-4" /> Draft
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave("scheduled")}
              disabled={saving || !caption.trim() || !scheduledAt}
              className="border-[#14213d]/20 text-[#14213d] hover:bg-[#14213d] hover:text-white"
            >
              <Clock className="h-4 w-4" /> Schedule
            </Button>
            <Button
              onClick={() => handleSave("published")}
              disabled={saving || !caption.trim()}
              className="gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Publish now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QuickTime({
  label,
  minutes,
  hours,
  days,
  forceTime,
  onClick,
}: {
  label: string;
  minutes?: number;
  hours?: number;
  days?: number;
  forceTime?: string;
  onClick: (v: string) => void;
}) {
  return (
    <button
      onClick={() => {
        const d = new Date();
        if (days) d.setDate(d.getDate() + days);
        if (hours) d.setHours(d.getHours() + hours);
        if (minutes) d.setMinutes(d.getMinutes() + minutes);
        if (forceTime) {
          const [h, m] = forceTime.split(":").map(Number);
          d.setHours(h, m, 0, 0);
        }
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        onClick(local);
      }}
      className="rounded-full bg-[#fff5e6] text-[#14213d] px-2.5 py-1 text-xs font-medium hover:bg-saffron hover:text-[#14213d] transition-colors"
    >
      {label}
    </button>
  );
}

function PostPreviewTab({
  caption,
  mediaUrls,
  account,
  user,
}: {
  caption: string;
  mediaUrls: string[];
  account: ReturnType<typeof useApp.getState>["accounts"][number] | null;
  user: ReturnType<typeof useApp.getState>["user"];
}) {
  const [platform, setPlatform] = useState<"instagram" | "facebook" | "twitter">(
    (account?.platform as any) === "facebook"
      ? "facebook"
      : (account?.platform as any) === "twitter"
      ? "twitter"
      : "instagram"
  );
  const [carouselIdx, setCarouselIdx] = useState(0);

  const handle = account?.handle || "your.business";
  const displayName = user?.businessName || user?.name || "Your Business";
  const avatarLetter = displayName.slice(0, 1).toUpperCase();

  const effectiveCaption = caption.trim() || "Aap ka caption yahan dikhega… preview ke liye Compose tab mein caption likhein.";
  const hasMedia = mediaUrls.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-[#6b6b73] mb-2 block">
          Platform preview
        </Label>
        <div className="flex gap-2">
          {(["instagram", "facebook", "twitter"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors",
                platform === p ? "gradient-saffron text-[#14213d]" : "border border-[#e5e5e5] text-[#6b6b73] hover:bg-[#fafafa]"
              )}
            >
              {p === "twitter" ? "X / Twitter" : p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-[280px_1fr] gap-5 items-start">
        {/* Phone mockup */}
        <div className="mx-auto w-full max-w-[280px]">
          <div className="relative rounded-[2.2rem] border-[10px] border-[#14213d] bg-white shadow-navy overflow-hidden dark:bg-[#0b1220]">
            {/* notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-28 bg-[#14213d] rounded-b-2xl z-10" />
            {/* status bar */}
            <div className="flex items-center justify-between px-5 pt-1.5 pb-1 text-[10px] text-[#14213d] dark:text-white">
              <span className="font-semibold">9:41</span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>LocalPost</span>
              </span>
            </div>

            {/* feed post */}
            <div className="pb-3">
              {/* header */}
              <div className="flex items-center gap-2 px-3 py-2">
                <div className={cn(
                  "h-8 w-8 rounded-full grid place-items-center text-white text-xs font-bold",
                  platform === "instagram" ? "bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#962fbf]" :
                  platform === "facebook" ? "bg-[#1877f2]" : "bg-[#0f1419]"
                )}>
                  {avatarLetter}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#14213d] dark:text-white truncate">{handle}</div>
                  <div className="text-[10px] text-[#6b6b73] dark:text-white/50">Sponsored · LocalPost</div>
                </div>
                <MoreHorizontal className="h-4 w-4 text-[#14213d] dark:text-white" />
              </div>

              {/* media */}
              {hasMedia ? (
                <div className="relative aspect-square bg-[#f4f4f5] dark:bg-white/5">
                  <img src={mediaUrls[carouselIdx]} alt="" className="h-full w-full object-cover" />
                  {mediaUrls.length > 1 && (
                    <>
                      <div className="absolute top-2 right-2 rounded-full bg-black/60 text-white text-[10px] px-2 py-0.5">
                        {carouselIdx + 1}/{mediaUrls.length}
                      </div>
                      {carouselIdx > 0 && (
                        <button
                          onClick={() => setCarouselIdx(carouselIdx - 1)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center h-6 w-6 rounded-full bg-white/80 text-[#14213d]"
                        >‹</button>
                      )}
                      {carouselIdx < mediaUrls.length - 1 && (
                        <button
                          onClick={() => setCarouselIdx(carouselIdx + 1)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center h-6 w-6 rounded-full bg-white/80 text-[#14213d]"
                        >›</button>
                      )}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {mediaUrls.map((_, i) => (
                          <span key={i} className={cn("h-1.5 w-1.5 rounded-full", i === carouselIdx ? "bg-white" : "bg-white/40")} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="aspect-square grid place-items-center bg-gradient-to-br from-[#fff5e6] to-[#fafafa] dark:from-white/5 dark:to-transparent">
                  <div className="text-center">
                    <ImageIcon className="h-10 w-10 mx-auto text-[#6b6b73]/40" />
                    <p className="text-[10px] text-[#6b6b73] mt-1">Media add nahi ki</p>
                  </div>
                </div>
              )}

              {/* actions */}
              <div className="flex items-center gap-3 px-3 pt-2.5">
                <Heart className="h-5 w-5 text-[#14213d] dark:text-white" />
                <MessageCircle className="h-5 w-5 text-[#14213d] dark:text-white" />
                {platform !== "twitter" && <Send className="h-5 w-5 text-[#14213d] dark:text-white" />}
                <Bookmark className="h-5 w-5 ml-auto text-[#14213d] dark:text-white" />
              </div>

              {/* caption */}
              <div className="px-3 pt-2 text-[11px] leading-snug">
                <span className="font-bold text-[#14213d] dark:text-white mr-1">{handle}</span>
                <span className="text-[#14213d] dark:text-white/90 whitespace-pre-wrap">{effectiveCaption}</span>
              </div>
              <div className="px-3 pt-1 text-[10px] text-[#6b6b73] dark:text-white/40">
                {Math.floor(Math.random() * 200) + 24} likes · 2 hours ago
              </div>
            </div>
          </div>
        </div>

        {/* preview insights */}
        <div className="space-y-3">
          <div className="rounded-xl border border-[#e5e5e5] p-4">
            <h4 className="text-sm font-bold text-[#14213d] mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4 text-saffron" /> Preview checklist
            </h4>
            <ul className="space-y-2 text-sm">
              <Checklist ok={caption.length > 0} label="Caption likha hua" hint={caption.length === 0 ? "Compose tab mein caption likhein" : `${caption.length} characters`} />
              <Checklist ok={hasMedia} label="Media attached" hint={hasMedia ? `${mediaUrls.length} image(s)` : "Kam az kam 1 image add karein"} />
              <Checklist ok={caption.length <= (platform === "twitter" ? 280 : platform === "instagram" ? 2200 : 63206)} label="Character limit ke andar" hint={platform === "twitter" ? "280 chars max" : "OK"} />
              <Checklist ok={caption.split(" ").filter((w) => w.startsWith("#")).length >= 3} label="3+ hashtags" hint="Reach badhane ke liye" />
            </ul>
          </div>
          <div className="rounded-xl border border-saffron/30 bg-[#fff5e6] p-4">
            <h4 className="text-sm font-bold text-[#14213d] mb-1 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-saffron" /> Pro tip
            </h4>
            <p className="text-xs text-[#6b6b73] leading-relaxed">
              Pehli 2 lines sab se important hain — yeh hi feed mein dikhti hain.
              Hook strong rakhein, CTA end mein. 3-5 hashtags optimal hain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Checklist({ ok, label, hint }: { ok: boolean; label: string; hint: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className={cn(
        "grid place-items-center h-5 w-5 rounded-full shrink-0",
        ok ? "bg-emerald-100 text-emerald-600" : "bg-[#f4f4f5] text-[#6b6b73]"
      )}>
        {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      </span>
      <span className="font-medium text-[#14213d] dark:text-white flex-1">{label}</span>
      <span className="text-xs text-[#6b6b73]">{hint}</span>
    </li>
  );
}

function HashGeneratorTab({
  topic,
  onAdd,
  currentHashtags,
  onRemove,
}: {
  topic: string;
  onAdd: (tags: string[]) => void;
  currentHashtags: string[];
  onRemove: (t: string) => void;
}) {
  const [input, setInput] = useState(topic);
  const [lang, setLang] = useState<"english" | "roman-urdu" | "mixed">("mixed");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ hashtags: string[]; estimatedReach?: string; bestTimes?: string } | null>(null);

  useEffect(() => {
    if (topic && !input) setInput(topic);
  }, [topic]);

  async function generate() {
    if (!input.trim()) {
      toast.error("Topic likhein (ya Compose tab mein caption likhein)");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: input, language: lang, count: 18 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      toast.success(`${data.hashtags?.length || 0} hashtags ready`);
    } catch (e: any) {
      toast.error(e.message || "Hashtag generation fail");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-saffron/30 bg-[#fffdf8] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Hash className="h-4 w-4 text-saffron" />
          <span className="text-sm font-bold text-[#14213d]">AI Hashtag Generator</span>
          <Badge className="ml-auto bg-saffron/20 text-[#b07300] border-0">Reach-optimized</Badge>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#6b6b73]">Topic / product</Label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. winter lawn sale, Karachi boutique, 25% off"
              rows={2}
              className="resize-none"
            />
            {!topic && (
              <p className="text-[10px] text-[#6b6b73]">Tip: Compose tab mein caption likhein to yahan auto-fill ho jata hai.</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#6b6b73]">Language style</Label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { v: "mixed", l: "Mixed 🇵🇰" },
                { v: "roman-urdu", l: "Roman Urdu" },
                { v: "english", l: "English" },
              ] as const).map((o) => (
                <button
                  key={o.v}
                  onClick={() => setLang(o.v)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-medium transition-colors border",
                    lang === o.v
                      ? "gradient-saffron text-[#14213d] border-transparent"
                      : "border-[#e5e5e5] text-[#6b6b73] hover:bg-[#fafafa]"
                  )}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={generate}
            disabled={loading}
            className="w-full gradient-saffron text-[#14213d] font-semibold hover:opacity-90"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Hashtags generate ho rahe hain…</>
            ) : (
              <><Sparkles className="h-4 w-4" /> 18 hashtags generate karein</>
            )}
          </Button>
        </div>
      </div>

      {result && result.hashtags && result.hashtags.length > 0 && (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            {result.estimatedReach && (
              <Badge className="bg-emerald-50 text-emerald-700 border-0 capitalize">
                <TrendingUp className="h-3 w-3 mr-1" /> {result.estimatedReach} reach
              </Badge>
            )}
            {result.bestTimes && (
              <Badge variant="outline" className="border-[#e5e5e5] text-[#6b6b73]">
                <Clock className="h-3 w-3 mr-1" /> {result.bestTimes}
              </Badge>
            )}
          </div>

          <div className="rounded-xl border border-[#e5e5e5] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#6b6b73]">
                {result.hashtags.length} suggested hashtags
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAdd(result.hashtags)}
                className="border-saffron/40 text-saffron hover:bg-[#fff5e6] h-7"
              >
                <Plus className="h-3.5 w-3.5" /> Sab add karein
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.hashtags.map((t) => {
                const clean = t.replace(/^#/, "");
                const added = currentHashtags.includes(clean);
                return (
                  <button
                    key={t}
                    onClick={() => onAdd([t])}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-all border",
                      added
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-[#fff5e6] text-[#14213d] border-saffron/30 hover:bg-saffron hover:text-[#14213d]"
                    )}
                  >
                    {t} {added && <Check className="h-3 w-3 inline ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {currentHashtags.length > 0 && (
        <div className="rounded-xl border border-[#e5e5e5] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#6b6b73]">
              Added to post ({currentHashtags.length})
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => currentHashtags.forEach(onRemove)}
              className="text-red-600 hover:bg-red-50 h-7"
            >
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentHashtags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#14213d] text-white px-3 py-1.5 text-xs font-medium"
              >
                #{t}
                <button onClick={() => onRemove(t)} className="hover:text-saffron">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FileUploadButton({
  onUploaded,
  disabled,
}: {
  onUploaded: (url: string) => void;
  disabled?: boolean;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Sirf image files allowed");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image 3MB se zyada nahi honi chahiye");
      return;
    }
    setUploading(true);
    try {
      // convert to base64 data URL
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        // send to /api/upload for validation
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        onUploaded(data.url);
      };
      reader.onerror = () => toast.error("File read fail");
      reader.readAsDataURL(file);
    } catch (e: any) {
      toast.error(e.message || "Upload fail");
    } finally {
      setUploading(false);
      e.target.value = ""; // reset so same file can be re-selected
    }
  }

  return (
    <label
      className={cn(
        "mt-2 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#e5e5e5] hover:border-saffron hover:bg-[#fff5e6] transition-colors px-3 py-2.5 text-sm font-medium text-[#6b6b73] hover:text-saffron cursor-pointer",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      {uploading ? (
        <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
      ) : (
        <><Upload className="h-4 w-4" /> Apni image upload karein (JPG/PNG, max 3MB)</>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFile}
        disabled={uploading || disabled}
        className="hidden"
      />
    </label>
  );
}

function ConflictCheck({
  datetime,
  accountId,
  excludePostId,
}: {
  datetime: string;
  accountId: string;
  excludePostId?: string;
}) {
  const [conflicts, setConflicts] = useState<{ id: string; caption: string; scheduledAt: string; platform: string; accountHandle: string; minutesDiff: number }[] | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!datetime) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConflicts(null);
      return;
    }
    setChecking(true);
    const iso = new Date(datetime).toISOString();
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/conflicts?datetime=${encodeURIComponent(iso)}${accountId ? `&accountId=${accountId}` : ""}${excludePostId ? `&excludePostId=${excludePostId}` : ""}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => setConflicts(d.conflicts || []))
        .catch(() => {})
        .finally(() => setChecking(false));
    }, 400);
    return () => { ctrl.abort(); clearTimeout(t); };
  }, [datetime, accountId, excludePostId]);

  if (!datetime) return null;

  if (checking) {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs text-[#6b6b73]">
        <Loader2 className="h-3 w-3 animate-spin" /> Conflicts check ho rahe hain…
      </div>
    );
  }

  if (!conflicts || conflicts.length === 0) {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-2.5 py-1.5">
        <CheckCircle2 className="h-3.5 w-3.5" /> No conflict — is time pe free hai
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-3">
      <div className="flex items-center gap-2 text-amber-800 text-xs font-bold mb-2">
        <AlertTriangle className="h-4 w-4" /> {conflicts.length} conflict{conflicts.length > 1 ? "s" : ""} — same time pe aur post{conflicts.length > 1 ? "s" : ""} bhi
      </div>
      <div className="space-y-1.5">
        {conflicts.map((c) => (
          <div key={c.id} className="flex items-center gap-2 text-xs text-amber-900">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
            <span className="truncate flex-1">{c.caption.slice(0, 35)}{c.caption.length > 35 ? "…" : ""}</span>
            <span className="text-amber-600 shrink-0">
              {c.minutesDiff === 0 ? "same time" : c.minutesDiff > 0 ? `+${c.minutesDiff}m` : `${c.minutesDiff}m`}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-amber-700 mt-2">Engagement distribute ho sakta hai. 30+ minute ka gap rakhein.</p>
    </div>
  );
}

function BestTimeSuggestions({ onPick }: { onPick: (v: string) => void }) {
  const [peaks, setPeaks] = useState<{ label: string; score: number; day: string; hour: number; posts: number }[]>([]);
  const [source, setSource] = useState<string>("");

  useEffect(() => {
    fetch("/api/best-time", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setPeaks(d.peakTimes || []);
        setSource(d.source || "");
      })
      .catch(() => {});
  }, []);

  if (peaks.length === 0) return null;

  // convert a (day, hour) to the next upcoming datetime-local string
  function pickTime(day: string, hour: number) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    // JS getDay: 0=Sun..6=Sat; our days[] is Mon-first
    const targetDayIdx = (days.indexOf(day) + 1) % 7; // to JS getDay
    const now = new Date();
    const result = new Date(now);
    let diff = targetDayIdx - now.getDay();
    if (diff <= 0) diff += 7;
    result.setDate(now.getDate() + diff);
    result.setHours(hour, 0, 0, 0);
    const local = new Date(result.getTime() - result.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    onPick(local);
  }

  return (
    <div className="mt-2 rounded-lg border border-saffron/30 bg-[#fffdf8] p-2.5">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#b07300] mb-1.5">
        <Sparkles className="h-3.5 w-3.5 text-saffron" />
        Best times {source === "real" ? "(aap ke data se)" : "(default)"}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {peaks.slice(0, 3).map((p, i) => (
          <button
            key={i}
            onClick={() => pickTime(p.day, p.hour)}
            className="inline-flex items-center gap-1.5 rounded-full bg-white border border-saffron/40 px-2.5 py-1 text-[11px] font-medium text-[#14213d] hover:bg-saffron hover:text-[#14213d] transition-colors"
            title={`${p.label} · ${Math.round(p.score * 100)}% engagement score`}
          >
            <Clock className="h-3 w-3 text-saffron" />
            {p.label}
            <span className="text-[9px] text-[#6b6b73]">{Math.round(p.score * 100)}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}
