import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { mapPost } from "@/lib/data";

// Publish queue — scheduled posts ordered by scheduledAt
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();

  const [due, upcoming] = await Promise.all([
    db.post.findMany({
      where: { userId: user.id, status: "scheduled", scheduledAt: { lte: now } },
      include: { account: true, metrics: true },
      orderBy: { scheduledAt: "asc" },
      take: 20,
    }),
    db.post.findMany({
      where: { userId: user.id, status: "scheduled", scheduledAt: { gt: now } },
      include: { account: true, metrics: true },
      orderBy: { scheduledAt: "asc" },
      take: 20,
    }),
  ]);

  return NextResponse.json({
    due: due.map(mapPost),
    upcoming: upcoming.map(mapPost),
    nextRunIn: computeNextRun(),
  });
}

function computeNextRun(): string {
  // simulate cron every 5 min
  const now = new Date();
  const min = now.getMinutes();
  const add = (5 - (min % 5)) % 5 || 5;
  const next = new Date(now.getTime() + add * 60 * 1000);
  const diffMs = next.getTime() - now.getTime();
  const min2 = Math.floor(diffMs / 60000);
  const sec = Math.floor((diffMs % 60000) / 1000);
  return `${min2}m ${sec}s`;
}
