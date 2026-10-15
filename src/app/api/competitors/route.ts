import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const COLORS = ["#fca311", "#e5484d", "#1877f2", "#10b981", "#8b5cf6", "#ec4899"];

const SAMPLE_HANDLES = [
  { handle: "karachi.styles", displayName: "Karachi Styles", platform: "instagram", followers: 8200 },
  { handle: "the.crafty.shop", displayName: "The Crafty Shop", platform: "instagram", followers: 15400 },
  { handle: "boutique.lhr", displayName: "Boutique Lahore", platform: "instagram", followers: 6300 },
  { handle: "urbandecor.pk", displayName: "Urban Decor PK", platform: "facebook", followers: 4100 },
];

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const competitors = await db.competitor.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    competitors: competitors.map((c) => ({
      id: c.id,
      handle: c.handle,
      platform: c.platform,
      displayName: c.displayName,
      followers: c.followers,
      avgEngagement: c.avgEngagement,
      postFrequency: c.postFrequency,
      notes: c.notes,
      color: c.color,
      createdAt: c.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { handle, platform } = (await req.json()) as { handle: string; platform: string };

    if (!handle?.trim()) {
      return NextResponse.json({ error: "Handle zaroori hai" }, { status: 400 });
    }

    const count = await db.competitor.count({ where: { userId: user.id } });
    if (count >= 10) {
      return NextResponse.json({ error: "Max 10 competitors track kar sakte hain" }, { status: 403 });
    }

    // pick a sample or generate mock data
    const sample = SAMPLE_HANDLES.find((s) => s.handle === handle.trim());
    const followers = sample?.followers ?? Math.floor(Math.random() * 20000) + 1500;
    const avgEngagement = Number((Math.random() * 4 + 1).toFixed(2)); // 1-5%
    const frequencies = ["daily", "weekly", "irregular"];
    const postFrequency = frequencies[Math.floor(Math.random() * frequencies.length)];

    const competitor = await db.competitor.create({
      data: {
        userId: user.id,
        handle: handle.trim().replace(/^@/, ""),
        platform: platform || sample?.platform || "instagram",
        displayName: sample?.displayName || handle.trim(),
        followers,
        avgEngagement,
        postFrequency,
        color: COLORS[count % COLORS.length],
      },
    });

    return NextResponse.json({
      competitor: {
        id: competitor.id,
        handle: competitor.handle,
        platform: competitor.platform,
        displayName: competitor.displayName,
        followers: competitor.followers,
        avgEngagement: competitor.avgEngagement,
        postFrequency: competitor.postFrequency,
        notes: competitor.notes,
        color: competitor.color,
        createdAt: competitor.createdAt.toISOString(),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Add fail" }, { status: 500 });
  }
}
