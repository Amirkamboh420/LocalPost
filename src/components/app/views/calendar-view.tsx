"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  List,
  Clock,
  GripVertical,
  Download,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  PlatformBadge,
  StatusBadge,
  PostThumb,
  EmptyState,
} from "@/components/app/shared";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CalendarView() {
  const posts = useApp((s) => s.posts);
  const openComposer = useApp((s) => s.openComposer);
  const openDetail = useApp((s) => s.openDetail);
  const [mode, setMode] = useState<"month" | "list">("month");
  const [cursor, setCursor] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<"all" | "scheduled" | "published" | "draft" | "failed">("all");
  const [search, setSearch] = useState("");

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (search && !p.caption.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [posts, statusFilter, search]);

  const postsByDay = useMemo(() => {
    const map: Record<string, Post[]> = {};
    for (const p of filteredPosts) {
      const d = p.scheduledAt || p.publishedAt;
      if (!d) continue;
      const key = new Date(d).toISOString().slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(p);
    }
    return map;
  }, [filteredPosts]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;
  const failedCount = posts.filter((p) => p.status === "failed").length;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="border-[#e5e5e5] h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-bold text-[#14213d] min-w-[160px] text-center">
            {cursor.toLocaleDateString("en-PK", { month: "long", year: "numeric" })}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="border-[#e5e5e5] h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCursor(new Date())}
            className="text-saffron hover:bg-[#fff5e6]"
          >
            Aaj
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[#e5e5e5] p-0.5 bg-white">
            <button
              onClick={() => setMode("month")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                mode === "month" ? "gradient-saffron text-[#14213d]" : "text-[#6b6b73] hover:bg-[#fafafa]"
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" /> Month
            </button>
            <button
              onClick={() => setMode("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                mode === "list" ? "gradient-saffron text-[#14213d]" : "text-[#6b6b73] hover:bg-[#fafafa]"
              )}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/api/export/posts";
            }}
            className="border-[#e5e5e5] text-[#14213d] hover:bg-[#fafafa]"
            title="CSV export"
          >
            <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={() => openComposer()} className="gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand">
            <Plus className="h-4 w-4" /> Naya Post
          </Button>
        </div>
      </div>

      {/* quick stats */}
      <div className="flex flex-wrap gap-3">
        <StatPill label="Scheduled" value={scheduledCount} color="bg-[#fff5e6] text-[#b07300]" />
        <StatPill label="Failed" value={failedCount} color="bg-red-50 text-red-600" />
        <StatPill label="Total posts" value={posts.length} color="bg-[#f4f4f5] text-[#6b6b73]" />
      </div>

      {/* filter + search toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex rounded-lg border border-[#e5e5e5] p-0.5 bg-white overflow-x-auto scroll-area-brand">
          {([
            { v: "all", l: "All" },
            { v: "scheduled", l: "Scheduled" },
            { v: "published", l: "Published" },
            { v: "draft", l: "Drafts" },
            { v: "failed", l: "Failed" },
          ] as const).map((f) => (
            <button
              key={f.v}
              onClick={() => setStatusFilter(f.v)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                statusFilter === f.v ? "gradient-saffron text-[#14213d]" : "text-[#6b6b73] hover:bg-[#fafafa]"
              )}
            >
              {f.l}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b73]" />
          <input
            placeholder="Captions search karein…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 h-9 w-full rounded-lg border border-[#e5e5e5] bg-[#fafafa] text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40 focus:border-saffron"
          />
        </div>
      </div>

      {posts.length === 0 ? (
        <Card className="border-[#e5e5e5]">
          <EmptyState
            icon={CalendarDays}
            title="Calendar khali hai"
            desc="Apna pehla post schedule karein. AI captions bhi try karein!"
            action={
              <Button onClick={() => openComposer()} className="gradient-saffron text-[#14213d] font-semibold">
                <Plus className="h-4 w-4" /> Post schedule karein
              </Button>
            }
          />
        </Card>
      ) : mode === "month" ? (
        <MonthGrid
          cells={cells}
          weekdays={weekdays}
          postsByDay={postsByDay}
          todayKey={todayKey}
          onAddPost={() => openComposer()}
          onPostClick={(id) => openDetail(id)}
          onReschedule={async (postId, newDate) => {
            const post = posts.find((p) => p.id === postId);
            if (!post) return;
            // preserve the time from existing scheduledAt if any
            const old = post.scheduledAt ? new Date(post.scheduledAt) : new Date();
            const next = new Date(newDate);
            next.setHours(old.getHours(), old.getMinutes(), 0, 0);
            try {
              const res = await fetch(`/api/posts/${postId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  scheduledAt: next.toISOString(),
                  status: post.status === "draft" ? "scheduled" : post.status,
                }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error);
              useApp.getState().upsertPost(data.post);
              toast.success(
                `Post reschedule ho gaya — ${next.toLocaleDateString("en-PK", { day: "numeric", month: "short" })} ${next.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}`
              );
            } catch (e: any) {
              toast.error(e.message || "Reschedule fail");
            }
          }}
        />
      ) : (
        <ListView posts={filteredPosts} />
      )}
    </div>
  );
}

function MonthGrid({
  cells,
  weekdays,
  postsByDay,
  todayKey,
  onAddPost,
  onPostClick,
  onReschedule,
}: {
  cells: (Date | null)[];
  weekdays: string[];
  postsByDay: Record<string, Post[]>;
  todayKey: string;
  onAddPost: () => void;
  onPostClick: (id: string) => void;
  onReschedule: (postId: string, newDate: Date) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  function handleDragStart(e: DragStartEvent) {
    const id = String(e.active.id);
    setActiveId(id);
    // find post
    for (const day of Object.values(postsByDay)) {
      const found = day.find((p) => p.id === id);
      if (found) {
        setActivePost(found);
        break;
      }
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    const overId = e.over?.id ? String(e.over.id) : null;
    setActiveId(null);
    setActivePost(null);
    setDragOverKey(null);
    if (!overId || !activeId) return;
    // over id is a date key like "2026-10-15"
    const newDate = new Date(overId + "T00:00:00");
    if (isNaN(newDate.getTime())) return;
    onReschedule(activeId, newDate);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => { setActiveId(null); setActivePost(null); setDragOverKey(null); }}
      onDragOver={(e) => {
        const overId = e.over?.id ? String(e.over.id) : null;
        setDragOverKey(overId);
      }}
    >
      <Card className="border-[#e5e5e5] overflow-hidden">
        <div className="grid grid-cols-7 border-b border-[#e5e5e5] bg-[#fafafa]">
          {weekdays.map((d) => (
            <div key={d} className="px-2 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-[#6b6b73]">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((date, i) => {
            if (!date) return <div key={i} className="min-h-[96px] sm:min-h-[120px] border-r border-b border-[#e5e5e5] bg-[#fafafa]" />;
            const key = date.toISOString().slice(0, 10);
            const dayPosts = postsByDay[key] || [];
            const isToday = key === todayKey;
            const isOver = dragOverKey === key;
            return (
              <DayCell
                key={i}
                dateKey={key}
                date={date}
                isToday={isToday}
                isOver={isOver}
                dayPosts={dayPosts}
                onAddPost={onAddPost}
                onPostClick={onPostClick}
                activeId={activeId}
              />
            );
          })}
        </div>
      </Card>
      <DragOverlay>
        {activePost ? (
          <div className="rounded-md bg-white border border-saffron shadow-brand px-2 py-1 text-[10px] text-[#14213d] flex items-center gap-1.5 max-w-[200px]">
            <GripVertical className="h-3 w-3 text-saffron shrink-0" />
            <span className="truncate">{activePost.caption.slice(0, 30)}…</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function DayCell({
  dateKey,
  date,
  isToday,
  isOver,
  dayPosts,
  onAddPost,
  onPostClick,
  activeId,
}: {
  dateKey: string;
  date: Date;
  isToday: boolean;
  isOver: boolean;
  dayPosts: Post[];
  onAddPost: () => void;
  onPostClick: (id: string) => void;
  activeId: string | null;
}) {
  const { setNodeRef, isOver: dndOver } = useDroppable({ id: dateKey });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[96px] sm:min-h-[120px] border-r border-b border-[#e5e5e5] p-1.5 relative group transition-colors",
        isOver || dndOver ? "bg-saffron/10 ring-2 ring-inset ring-saffron/40" : "hover:bg-[#fffdf8]"
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "grid place-items-center h-6 w-6 rounded-full text-xs font-semibold",
            isToday ? "gradient-saffron text-[#14213d]" : "text-[#14213d]"
          )}
        >
          {date.getDate()}
        </span>
        <button
          onClick={onAddPost}
          className="opacity-0 group-hover:opacity-100 text-[#6b6b73] hover:text-saffron transition-opacity"
          title="Add post"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-1 space-y-1">
        {dayPosts.slice(0, 3).map((p) => (
          <DraggablePost
            key={p.id}
            post={p}
            onClick={() => onPostClick(p.id)}
            isDragging={activeId === p.id}
          />
        ))}
        {dayPosts.length > 3 && (
          <div className="text-[10px] text-saffron font-medium px-1.5">
            +{dayPosts.length - 3} aur
          </div>
        )}
      </div>
    </div>
  );
}

function DraggablePost({
  post,
  onClick,
  isDragging,
}: {
  post: Post;
  onClick: () => void;
  isDragging: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging: dndDragging } = useDraggable({
    id: post.id,
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // only treat as click if not dragging
        if (!dndDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={cn(
        "w-full flex items-center gap-1.5 rounded px-1.5 py-1 text-left hover:bg-white border border-transparent hover:border-[#e5e5e5] transition-colors cursor-grab active:cursor-grabbing",
        (isDragging || dndDragging) && "opacity-30"
      )}
      title="Drag to reschedule ya click to view"
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full shrink-0",
          post.status === "scheduled" && "bg-saffron",
          post.status === "published" && "bg-emerald-500",
          post.status === "failed" && "bg-red-500",
          post.status === "draft" && "bg-[#6b6b73]"
        )}
      />
      <span className="text-[10px] text-[#14213d] truncate flex-1">
        {post.caption.slice(0, 24)}…
      </span>
      {post.account && (
        <span className="text-[9px] text-[#6b6b73] hidden sm:inline">
          {post.account.platform === "instagram" ? "IG" : post.account.platform === "facebook" ? "FB" : post.account.platform === "twitter" ? "X" : "•"}
        </span>
      )}
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold", color)}>
      {value} {label}
    </div>
  );
}

function ListView({ posts }: { posts: Post[] }) {
  const openDetail = useApp((s) => s.openDetail);
  const openComposer = useApp((s) => s.openComposer);

  const sorted = [...posts]
    .filter((p) => p.scheduledAt || p.publishedAt)
    .sort((a, b) => {
      const da = new Date(a.scheduledAt || a.publishedAt || 0).getTime();
      const db = new Date(b.scheduledAt || b.publishedAt || 0).getTime();
      return db - da;
    });

  return (
    <Card className="border-[#e5e5e5] divide-y divide-[#e5e5e5]">
      {sorted.map((p) => {
        const d = p.scheduledAt || p.publishedAt;
        return (
          <button
            key={p.id}
            onClick={() => openDetail(p.id)}
            className="w-full flex items-center gap-3 p-3 hover:bg-[#fafafa] transition-colors text-left"
          >
            <PostThumb post={p} className="h-12 w-12 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                {p.account && <PlatformBadge platform={p.account.platform} />}
                <StatusBadge status={p.status} />
              </div>
              <div className="text-sm font-medium text-[#14213d] truncate">{p.caption}</div>
            </div>
            {d && (
              <div className="text-right shrink-0 hidden sm:block">
                <div className="text-xs font-bold text-[#14213d]">
                  {new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                </div>
                <div className="text-[11px] text-[#6b6b73] flex items-center gap-0.5 justify-end">
                  <Clock className="h-3 w-3" />
                  {new Date(d).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            )}
          </button>
        );
      })}
      <div className="p-4 text-center">
        <Button variant="outline" onClick={() => openComposer()} className="border-[#e5e5e5]">
          <Plus className="h-4 w-4" /> Aur posts add karein
        </Button>
      </div>
    </Card>
  );
}
