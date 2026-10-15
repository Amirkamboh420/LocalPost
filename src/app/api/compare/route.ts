import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Compare two published posts side-by-side
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const aId = url.searchParams.get("a");
  const bId = url.searchParams.get("b");

  if (!aId || !bId) {
    return NextResponse.json({ error: "Do post IDs zaroori hain (?a=...&b=...)" }, { status: 400 });
  }

  const [postA, postB] = await Promise.all([
    db.post.findUnique({ where: { id: aId }, include: { metrics: true, account: true } }),
    db.post.findUnique({ where: { id: bId }, include: { metrics: true, account: true } }),
  ]);

  if (!postA || postA.userId !== user.id || !postB || postB.userId !== user.id) {
    return NextResponse.json({ error: "Posts nahi mile" }, { status: 404 });
  }

  function summarize(p: any) {
    const m = p.metrics;
    const eng = m && m.impressions > 0
      ? Number((((m.likes + m.comments + m.shares) / m.impressions) * 100).toFixed(2))
      : 0;
    return {
      id: p.id,
      caption: p.caption,
      mediaUrls: JSON.parse(p.mediaUrls || "[]"),
      platform: p.account?.platform ?? "instagram",
      accountHandle: p.account?.handle ?? "",
      publishedAt: p.publishedAt?.toISOString() ?? null,
      hashtags: JSON.parse(p.hashtags || "[]"),
      metrics: m
        ? {
            likes: m.likes,
            comments: m.comments,
            shares: m.shares,
            reach: m.reach,
            impressions: m.impressions,
            saves: m.saves,
            engagementRate: eng,
          }
        : null,
    };
  }

  const a = summarize(postA);
  const b = summarize(postB);

  // determine winner per metric
  const metrics = ["likes", "comments", "shares", "reach", "impressions", "saves", "engagementRate"] as const;
  const winners: Record<string, "a" | "b" | "tie"> = {};
  for (const k of metrics) {
    if (!a.metrics || !b.metrics) { winners[k] = "tie"; continue; }
    const va = a.metrics[k] as number;
    const vb = b.metrics[k] as number;
    winners[k] = va === vb ? "tie" : va > vb ? "a" : "b";
  }

  // overall winner by engagement rate, then reach
  let overall: "a" | "b" | "tie" = "tie";
  if (a.metrics && b.metrics) {
    if (a.metrics.engagementRate !== b.metrics.engagementRate) {
      overall = a.metrics.engagementRate > b.metrics.engagementRate ? "a" : "b";
    } else if (a.metrics.reach !== b.metrics.reach) {
      overall = a.metrics.reach > b.metrics.reach ? "a" : "b";
    }
  }

  return NextResponse.json({ a, b, winners, overall });
}
