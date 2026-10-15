import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Cron-based auto-publish simulation.
// Finds scheduled posts whose scheduledAt <= now and publishes them
// (creates metrics + notification + marks published).
// Protected by a shared secret to prevent public abuse.
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET || "localpost-cron-dev";
  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const due = await db.post.findMany({
    where: {
      status: "scheduled",
      scheduledAt: { lte: now },
    },
    include: { account: true },
    take: 50,
  });

  let publishedCount = 0;
  const published: { id: string; caption: string; platform: string }[] = [];
  const errors: { id: string; error: string }[] = [];

  for (const post of due) {
    try {
      // simulate publish
      const updated = await db.post.update({
        where: { id: post.id },
        data: { status: "published", publishedAt: now },
      });

      // create metrics if not present
      const existing = await db.postMetric.findUnique({ where: { postId: post.id } });
      if (!existing) {
        await db.postMetric.create({
          data: {
            postId: post.id,
            likes: Math.floor(Math.random() * 320) + 20,
            comments: Math.floor(Math.random() * 40) + 2,
            shares: Math.floor(Math.random() * 25),
            reach: Math.floor(Math.random() * 4000) + 300,
            impressions: Math.floor(Math.random() * 6000) + 500,
            saves: Math.floor(Math.random() * 30),
          },
        });
      }

      // notify the owner
      await db.notification.create({
        data: {
          userId: post.userId,
          type: "post_published",
          title: "Post auto-published!",
          message: `Scheduled post publish ho gaya: "${post.caption.slice(0, 50)}${post.caption.length > 50 ? "…" : ""}"`,
          read: false,
        },
      });

      publishedCount++;
      published.push({
        id: updated.id,
        caption: post.caption,
        platform: post.account?.platform ?? "instagram",
      });
    } catch (e: any) {
      errors.push({ id: post.id, error: e.message });
    }
  }

  return NextResponse.json({
    publishedCount,
    published,
    errors,
    checkedAt: now.toISOString(),
  });
}
