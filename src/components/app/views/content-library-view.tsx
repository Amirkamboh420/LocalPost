"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/store/app-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Search,
  FolderOpen,
  Image as ImageIcon,
  FileText,
  Copy,
  Trash2,
  Wand2,
  Loader2,
} from "lucide-react";
import { EmptyState } from "@/components/app/shared";
import type { ContentItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const DEMO_IMAGES = [
  "https://picsum.photos/seed/cl1/800/800",
  "https://picsum.photos/seed/cl2/800/800",
  "https://picsum.photos/seed/cl3/800/800",
  "https://picsum.photos/seed/cl4/800/800",
  "https://picsum.photos/seed/cl5/800/800",
  "https://picsum.photos/seed/cl6/800/800",
];

export function ContentLibraryView() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "image" | "caption" | "template">("all");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newType, setNewType] = useState<"image" | "caption" | "template">("caption");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newTags, setNewTags] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!newTitle.trim()) {
      toast.error("Title likhein");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newType,
          title: newTitle,
          content: newContent || null,
          url: newUrl || null,
          tags: newTags || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems([data.item, ...items]);
      toast.success("Content library mein add ho gaya");
      setAddOpen(false);
      setNewTitle("");
      setNewContent("");
      setNewUrl("");
      setNewTags("");
    } catch (e: any) {
      toast.error(e.message || "Add fail");
    } finally {
      setSaving(false);
    }
  }

  const filtered = items.filter((i) => {
    if (filter !== "all" && i.type !== filter) return false;
    if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#14213d]">Content library</h2>
          <p className="text-sm text-[#6b6b73]">Reusable captions, templates aur media</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand">
          <Plus className="h-4 w-4" /> Add content
        </Button>
      </div>

      {/* filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b73]" />
          <Input
            placeholder="Search content…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex rounded-lg border border-[#e5e5e5] p-0.5 bg-white">
          {(["all", "caption", "template", "image"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors",
                filter === f ? "gradient-saffron text-[#14213d]" : "text-[#6b6b73] hover:bg-[#fafafa]"
              )}
            >
              {f === "all" ? "All" : f + "s"}
            </button>
          ))}
        </div>
      </div>

      {/* grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-xl bg-[#f4f4f5] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-[#e5e5e5]">
          <EmptyState
            icon={FolderOpen}
            title="Library khali hai"
            desc="Reusable captions, templates aur media save karein taake future posts mein jaldi use kar sakein."
            action={
              <Button onClick={() => setAddOpen(true)} className="gradient-saffron text-[#14213d] font-semibold">
                <Plus className="h-4 w-4" /> Add first content
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className="border-[#e5e5e5] overflow-hidden hover:shadow-navy transition-shadow group">
              {item.type === "image" && item.url ? (
                <div className="aspect-video bg-[#f4f4f5] overflow-hidden">
                  <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className={cn(
                  "h-2",
                  item.type === "caption" ? "bg-saffron" : "bg-[#14213d]"
                )} />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className={cn(
                    "border-0 capitalize text-[10px]",
                    item.type === "caption" ? "bg-saffron/15 text-[#b07300]" :
                    item.type === "template" ? "bg-[#14213d] text-saffron" :
                    "bg-[#f4f4f5] text-[#6b6b73]"
                  )}>
                    {item.type === "caption" ? <FileText className="h-3 w-3 mr-1" /> :
                     item.type === "template" ? <Wand2 className="h-3 w-3 mr-1" /> :
                     <ImageIcon className="h-3 w-3 mr-1" />}
                    {item.type}
                  </Badge>
                  <button
                    onClick={() => navigator.clipboard.writeText(item.content || item.url || "")}
                    className="opacity-0 group-hover:opacity-100 grid place-items-center h-7 w-7 rounded-md hover:bg-[#fafafa] text-[#6b6b73] transition-all"
                    title="Copy"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h3 className="font-bold text-[#14213d] text-sm truncate">{item.title}</h3>
                {item.content && (
                  <p className="text-xs text-[#6b6b73] mt-1.5 line-clamp-3 leading-relaxed">{item.content}</p>
                )}
                {item.tags && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.tags.split(",").map((t) => (
                      <span key={t} className="text-[10px] text-saffron">#{t.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Content add karein</DialogTitle>
            <DialogDescription>
              Reusable caption, template ya media URL save karein.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3.5 mt-2">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={newType} onValueChange={(v) => setNewType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="caption">Caption</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="image">Image (URL)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Sale announcement template" />
            </div>
            {newType !== "image" && (
              <div className="space-y-1.5">
                <Label>Content</Label>
                <Textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Apna caption ya template text…"
                  rows={4}
                  className="resize-none"
                />
              </div>
            )}
            {newType === "image" && (
              <div className="space-y-1.5">
                <Label>Image URL</Label>
                <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://…" />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="text-xs text-[#6b6b73] mr-1">Quick:</span>
                  {DEMO_IMAGES.slice(0, 4).map((u) => (
                    <button
                      key={u}
                      onClick={() => setNewUrl(u)}
                      className="h-8 w-8 rounded-md overflow-hidden border border-[#e5e5e5] hover:border-saffron"
                    >
                      <img src={u} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Tags (comma separated)</Label>
              <Input value={newTags} onChange={(e) => setNewTags(e.target.value)} placeholder="sale, promotion, festival" />
            </div>
            <Button
              onClick={handleAdd}
              disabled={saving}
              className="w-full gradient-saffron text-[#14213d] font-semibold hover:opacity-90"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Save to library
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
