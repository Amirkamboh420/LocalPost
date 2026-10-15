import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Media library — all images from posts + content items
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [posts, contentItems] = await Promise.all([
    db.post.findMany({
      where: { userId: user.id },
      select: { mediaUrls: true, caption: true, createdAt: true, status: true },
    }),
    db.contentItem.findMany({
      where: { userId: user.id, type: "image" },
    }),
  ]);

  const media: { url: string; caption: string; createdAt: string; status: string; source: "post" | "library" }[] = [];

  for (const p of posts) {
    try {
      const urls: string[] = JSON.parse(p.mediaUrls || "[]");
      for (const url of urls) {
        if (url && url.startsWith("http")) {
          media.push({
            url,
            caption: p.caption,
            createdAt: p.createdAt.toISOString(),
            status: p.status,
            source: "post",
          });
        }
      }
    } catch {}
  }

  for (const c of contentItems) {
    if (c.url) {
      media.push({
        url: c.url,
        caption: c.title,
        createdAt: c.createdAt.toISOString(),
        status: "library",
        source: "library",
      });
    }
  }

  // dedupe by url
  const seen = new Set<string>();
  const deduped = media.filter((m) => {
    if (seen.has(m.url)) return false;
    seen.add(m.url);
    return true;
  });

  return NextResponse.json({ media: deduped });
}
