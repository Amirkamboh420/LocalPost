import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await db.post.findMany({
    where: { userId: user.id, status: "published" },
    include: { metrics: true, account: true },
  });

  const accounts = await db.account.findMany({ where: { userId: user.id } });

  const totalReach = posts.reduce((s, p) => s + (p.metrics?.reach ?? 0), 0);
  const totalLikes = posts.reduce((s, p) => s + (p.metrics?.likes ?? 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.metrics?.comments ?? 0), 0);
  const totalImpressions = posts.reduce(
    (s, p) => s + (p.metrics?.impressions ?? 0),
    0
  );
  const totalShares = posts.reduce((s, p) => s + (p.metrics?.shares ?? 0), 0);
  const totalFollowers = accounts.reduce((s, a) => s + a.followers, 0);
  const engagementRate =
    totalImpressions > 0
      ? Number((((totalLikes + totalComments + totalShares) / totalImpressions) * 100).toFixed(2))
      : 0;

  // last 7 days timeseries
  const days: { date: string; reach: number; engagement: number; posts: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const dayPosts = posts.filter((p) => {
      const pd = p.publishedAt ? new Date(p.publishedAt) : null;
      return pd && pd >= d && pd < next;
    });
    days.push({
      date: d.toISOString().slice(0, 10),
      reach: dayPosts.reduce((s, p) => s + (p.metrics?.reach ?? 0), 0),
      engagement:
        dayPosts.reduce((s, p) => s + (p.metrics?.likes ?? 0) + (p.metrics?.comments ?? 0), 0),
      posts: dayPosts.length,
    });
  }

  // per-platform breakdown
  const platformBreakdown = accounts.map((a) => {
    const platPosts = posts.filter((p) => p.accountId === a.id);
    return {
      platform: a.platform,
      handle: a.handle,
      followers: a.followers,
      posts: platPosts.length,
      reach: platPosts.reduce((s, p) => s + (p.metrics?.reach ?? 0), 0),
      likes: platPosts.reduce((s, p) => s + (p.metrics?.likes ?? 0), 0),
    };
  });

  // top posts
  const topPosts = [...posts]
    .sort((a, b) => (b.metrics?.reach ?? 0) - (a.metrics?.reach ?? 0))
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      caption: p.caption,
      reach: p.metrics?.reach ?? 0,
      likes: p.metrics?.likes ?? 0,
      comments: p.metrics?.comments ?? 0,
      platform: p.account?.platform ?? "instagram",
      publishedAt: p.publishedAt?.toISOString() ?? null,
    }));

  return NextResponse.json({
    summary: {
      totalPosts: posts.length,
      totalReach,
      totalLikes,
      totalComments,
      totalImpressions,
      totalShares,
      totalFollowers,
      engagementRate,
      accountsConnected: accounts.length,
    },
    timeseries: days,
    platformBreakdown,
    topPosts,
  });
}
