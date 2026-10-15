import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Weekly analytics report — last 7 days vs previous 7 days
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [thisWeek, lastWeek, accounts, topPosts] = await Promise.all([
    db.post.findMany({
      where: { userId: user.id, status: "published", publishedAt: { gte: weekAgo } },
      include: { metrics: true, account: true },
    }),
    db.post.findMany({
      where: {
        userId: user.id,
        status: "published",
        publishedAt: { gte: twoWeeksAgo, lt: weekAgo },
      },
      include: { metrics: true },
    }),
    db.account.findMany({ where: { userId: user.id } }),
    db.post.findMany({
      where: { userId: user.id, status: "published", publishedAt: { gte: weekAgo } },
      include: { metrics: true, account: true },
    }),
  ]);

  function summarize(posts: any[]) {
    return {
      posts: posts.length,
      reach: posts.reduce((s, p) => s + (p.metrics?.reach ?? 0), 0),
      likes: posts.reduce((s, p) => s + (p.metrics?.likes ?? 0), 0),
      comments: posts.reduce((s, p) => s + (p.metrics?.comments ?? 0), 0),
      shares: posts.reduce((s, p) => s + (p.metrics?.shares ?? 0), 0),
      impressions: posts.reduce((s, p) => s + (p.metrics?.impressions ?? 0), 0),
      saves: posts.reduce((s, p) => s + (p.metrics?.saves ?? 0), 0),
    };
  }

  const thisSum = summarize(thisWeek);
  const lastSum = summarize(lastWeek);

  function pct(curr: number, prev: number): number {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Number((((curr - prev) / prev) * 100).toFixed(0));
  }

  const deltas = {
    posts: pct(thisSum.posts, lastSum.posts),
    reach: pct(thisSum.reach, lastSum.reach),
    likes: pct(thisSum.likes, lastSum.likes),
    comments: pct(thisSum.comments, lastSum.comments),
    shares: pct(thisSum.shares, lastSum.shares),
  };

  // top 3 posts this week
  const top = [...topPosts]
    .sort((a, b) => (b.metrics?.reach ?? 0) - (a.metrics?.reach ?? 0))
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      caption: p.caption,
      platform: p.account?.platform ?? "instagram",
      reach: p.metrics?.reach ?? 0,
      likes: p.metrics?.likes ?? 0,
      publishedAt: p.publishedAt?.toISOString() ?? null,
    }));

  // per-platform breakdown
  const platformBreakdown = accounts.map((a) => {
    const platPosts = thisWeek.filter((p) => p.accountId === a.id);
    return {
      platform: a.platform,
      handle: a.handle,
      posts: platPosts.length,
      reach: platPosts.reduce((s, p) => s + (p.metrics?.reach ?? 0), 0),
      likes: platPosts.reduce((s, p) => s + (p.metrics?.likes ?? 0), 0),
    };
  });

  return NextResponse.json({
    period: { start: weekAgo.toISOString(), end: now.toISOString() },
    summary: thisSum,
    deltas,
    top,
    platformBreakdown,
    totalFollowers: accounts.reduce((s, a) => s + a.followers, 0),
    accountsConnected: accounts.length,
  });
}
