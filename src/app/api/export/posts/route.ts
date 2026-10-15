import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getUserPosts } from "@/lib/data";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await getUserPosts(user.id);

  function csvCell(v: string): string {
    if (/[",\n]/.test(v)) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  }

  const header = ["caption", "platform", "status", "scheduledAt", "publishedAt", "hashtags", "likes", "comments", "reach"].join(",");
  const rows = posts.map((p) => {
    return [
      csvCell(p.caption),
      csvCell(p.account?.platform || ""),
      csvCell(p.status),
      csvCell(p.scheduledAt ? new Date(p.scheduledAt).toISOString() : ""),
      csvCell(p.publishedAt ? new Date(p.publishedAt).toISOString() : ""),
      csvCell(p.hashtags.join(";")),
      String(p.metrics?.likes ?? ""),
      String(p.metrics?.comments ?? ""),
      String(p.metrics?.reach ?? ""),
    ].join(",");
  });

  const csv = [header, ...rows].join("\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="localpost-posts-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
