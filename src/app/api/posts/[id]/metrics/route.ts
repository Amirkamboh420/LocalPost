import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Per-post engagement timeseries (first 7 days after publish).
// Mock deterministic growth curve based on actual metric totals.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const post = await db.post.findUnique({
    where: { id },
    include: { metrics: true, account: true },
  });
  if (!post || post.userId !== user.id) {
    return NextResponse.json({ error: "Post nahi mila" }, { status: 404 });
  }

  const m = post.metrics;
  const totalLikes = m?.likes ?? 0;
  const totalReach = m?.reach ?? 0;
  const totalComments = m?.comments ?? 0;
  const totalImpressions = m?.impressions ?? 0;

  // Build a 7-point timeseries (day 0 = publish day, day 6 = 6 days later)
  // using a realistic decay curve: most engagement in first 2 days.
  const weights = [0.42, 0.25, 0.13, 0.08, 0.05, 0.04, 0.03];
  const series = weights.map((w, i) => {
    const date = new Date(post.publishedAt || post.createdAt);
    date.setDate(date.getDate() + i);
    return {
      day: i,
      date: date.toISOString().slice(0, 10),
      label: i === 0 ? "Day 0" : `+${i}d`,
      likes: Math.round(totalLikes * w),
      reach: Math.round(totalReach * w),
      comments: Math.round(totalComments * w),
      impressions: Math.round(totalImpressions * w),
    };
  });

  // engagement rate
  const engRate = totalImpressions > 0
    ? Number((((totalLikes + totalComments + (m?.shares ?? 0)) / totalImpressions) * 100).toFixed(2))
    : 0;

  // benchmark vs account average (mock)
  const accountPosts = await db.post.findMany({
    where: { userId: user.id, accountId: post.accountId, status: "published" },
    include: { metrics: true },
  });
  const avgReach = accountPosts.length > 0
    ? Math.round(accountPosts.reduce((s, p) => s + (p.metrics?.reach ?? 0), 0) / accountPosts.length)
    : totalReach;
  const vsAverage = avgReach > 0
    ? Number((((totalReach - avgReach) / avgReach) * 100).toFixed(0))
    : 0;

  return NextResponse.json({
    post: {
      id: post.id,
      caption: post.caption,
      platform: post.account?.platform ?? "instagram",
      publishedAt: post.publishedAt?.toISOString() ?? null,
    },
    metrics: m
      ? {
          likes: m.likes,
          comments: m.comments,
          shares: m.shares,
          reach: m.reach,
          impressions: m.impressions,
          saves: m.saves,
          engagementRate: engRate,
        }
      : null,
    series,
    benchmark: {
      accountAvgReach: avgReach,
      vsAverage, // % above/below average
      totalPublished: accountPosts.length,
    },
  });
}
