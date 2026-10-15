import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Scheduling conflict detection
// Returns posts that conflict with a given datetime (within ±30 min window)
// ?datetime=ISO&excludePostId=optional&accountId=optional
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const datetime = url.searchParams.get("datetime");
  const excludePostId = url.searchParams.get("excludePostId") || undefined;
  const accountId = url.searchParams.get("accountId") || undefined;

  if (!datetime) {
    return NextResponse.json({ error: "datetime param zaroori hai" }, { status: 400 });
  }

  const target = new Date(datetime);
  if (isNaN(target.getTime())) {
    return NextResponse.json({ error: "Invalid datetime" }, { status: 400 });
  }

  // ±30 minute window
  const windowMs = 30 * 60 * 1000;
  const start = new Date(target.getTime() - windowMs);
  const end = new Date(target.getTime() + windowMs);

  const where: any = {
    userId: user.id,
    status: "scheduled",
    scheduledAt: { gte: start, lte: end },
  };
  if (excludePostId) where.id = { not: excludePostId };
  if (accountId) where.accountId = accountId;

  const conflicts = await db.post.findMany({
    where,
    include: { account: true, metrics: true },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json({
    target: target.toISOString(),
    conflicts: conflicts.map((p) => ({
      id: p.id,
      caption: p.caption,
      scheduledAt: p.scheduledAt?.toISOString() ?? null,
      platform: p.account?.platform ?? "instagram",
      accountHandle: p.account?.handle ?? "",
      minutesDiff: p.scheduledAt
        ? Math.round((p.scheduledAt.getTime() - target.getTime()) / 60000)
        : 0,
    })),
  });
}
