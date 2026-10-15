import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { mapPost } from "@/lib/data";

// Create recurring posts from a base post.
// Pattern: daily | weekly | weekdays | monthly
// count: how many occurrences (max 30)
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { basePostId, pattern, count, intervalDays } = (await req.json()) as {
      basePostId: string;
      pattern: "daily" | "weekly" | "weekdays" | "monthly" | "custom";
      count: number;
      intervalDays?: number;
    };

    const base = await db.post.findUnique({ where: { id: basePostId } });
    if (!base || base.userId !== user.id) {
      return NextResponse.json({ error: "Base post nahi mila" }, { status: 404 });
    }

    const n = Math.min(Math.max(count ?? 5, 1), 30);
    const created: any[] = [];

    let anchor = base.scheduledAt
      ? new Date(base.scheduledAt)
      : new Date(Date.now() + 60 * 60 * 1000);

    for (let i = 1; i <= n; i++) {
      const next = new Date(anchor);
      if (pattern === "daily") {
        next.setDate(next.getDate() + i);
      } else if (pattern === "weekly") {
        next.setDate(next.getDate() + i * 7);
      } else if (pattern === "monthly") {
        next.setMonth(next.getMonth() + i);
      } else if (pattern === "weekdays") {
        // skip Sat (6) / Sun (0)
        let added = 0;
        const tmp = new Date(anchor);
        while (added < i) {
          tmp.setDate(tmp.getDate() + 1);
          if (tmp.getDay() !== 0 && tmp.getDay() !== 6) added++;
        }
        next.setTime(tmp.getTime());
      } else if (pattern === "custom") {
        const d = Math.max(1, intervalDays ?? 3);
        next.setDate(next.getDate() + i * d);
      }

      const post = await db.post.create({
        data: {
          userId: user.id,
          accountId: base.accountId,
          caption: base.caption,
          mediaUrls: base.mediaUrls,
          mediaType: base.mediaType,
          hashtags: base.hashtags,
          status: "scheduled",
          scheduledAt: next,
        },
        include: { account: true, metrics: true },
      });
      created.push(mapPost(post));
    }

    return NextResponse.json({ created: created.length, posts: created });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Recurring creation fail" }, { status: 500 });
  }
}
