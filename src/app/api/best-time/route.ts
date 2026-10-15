import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Real best-time-to-post algorithm — computes engagement by weekday × hour
// from the user's actual published posts + metrics.
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await db.post.findMany({
    where: { userId: user.id, status: "published", publishedAt: { not: null } },
    include: { metrics: true },
  });

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  // 24 hour buckets; index = hour 0-23. We map JS getDay() (0=Sun..6=Sat) to Mon-first.
  const buckets: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  const counts: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

  let totalEng = 0;
  let totalPosts = 0;

  for (const p of posts) {
    if (!p.publishedAt || !p.metrics) continue;
    const d = new Date(p.publishedAt);
    // JS: 0=Sun, 1=Mon...6=Sat → Mon-first index = (getDay()+6)%7
    const dayIdx = (d.getDay() + 6) % 7;
    const hour = d.getHours();
    const eng = p.metrics.likes + p.metrics.comments + p.metrics.shares + p.metrics.saves;
    buckets[dayIdx][hour] += eng;
    counts[dayIdx][hour] += 1;
    totalEng += eng;
    totalPosts += 1;
  }

  // If no real data, fall back to a sensible default curve
  if (totalPosts === 0) {
    return NextResponse.json({
      source: "default",
      heatmap: buildDefaultHeatmap(),
      peakTimes: [
        { day: "Fri", hour: 19, label: "Fri 7 PM", score: 0.92 },
        { day: "Sat", hour: 20, label: "Sat 8 PM", score: 0.88 },
        { day: "Wed", hour: 19, label: "Wed 7 PM", score: 0.7 },
      ],
      avgEngagementRate: 0,
      sampleSize: 0,
    });
  }

  // normalize: per-bucket average engagement, then scale 0-1
  let maxAvg = 0;
  const avgGrid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const avg = counts[d][h] > 0 ? buckets[d][h] / counts[d][h] : 0;
      avgGrid[d][h] = avg;
      if (avg > maxAvg) maxAvg = avg;
    }
  }

  const heatmap = avgGrid.map((row, d) =>
    row.map((v) => (maxAvg > 0 ? v / maxAvg : 0))
  );

  // find top 3 slots
  const slots: { day: string; hour: number; label: string; score: number; eng: number; posts: number }[] = [];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      if (counts[d][h] > 0) {
        slots.push({
          day: days[d],
          hour: h,
          label: `${days[d]} ${formatHour(h)}`,
          score: heatmap[d][h],
          eng: Math.round(buckets[d][h] / counts[d][h]),
          posts: counts[d][h],
        });
      }
    }
  }
  slots.sort((a, b) => b.score - a.score);
  // if fewer than 3 slots with data, pad with default suggestions
  const peakTimes = slots.slice(0, 3);

  const avgEngagementRate = totalPosts > 0
    ? Number((totalEng / totalPosts).toFixed(1))
    : 0;

  return NextResponse.json({
    source: "real",
    heatmap,
    peakTimes: peakTimes.length > 0 ? peakTimes : [
      { day: "Fri", hour: 19, label: "Fri 7 PM", score: 0.92, eng: 0, posts: 0 },
    ],
    avgEngagementRate,
    sampleSize: totalPosts,
    days,
  });
}

function buildDefaultHeatmap() {
  const grid: number[][] = [];
  for (let d = 0; d < 7; d++) {
    const row: number[] = [];
    for (let h = 0; h < 24; h++) {
      let base = 0.1;
      if (h >= 18 && h <= 21) base = 0.85;
      else if (h >= 12 && h <= 14) base = 0.55;
      else if (h >= 9 && h <= 11) base = 0.45;
      else if (h >= 15 && h <= 17) base = 0.4;
      if (d === 4 || d === 5) base += 0.12;
      row.push(Math.min(1, base));
    }
    grid.push(row);
  }
  return grid;
}

function formatHour(h: number) {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}
