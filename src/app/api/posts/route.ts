import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { getUserPosts } from "@/lib/data";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const posts = await getUserPosts(user.id);
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // role guard: viewers cannot create posts
  if (user.role === "viewer") {
    return NextResponse.json({ error: "Forbidden — viewers cannot create posts" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { caption, mediaUrls, mediaType, hashtags, accountId, scheduledAt, status } =
      body as {
        caption: string;
        mediaUrls: string[];
        mediaType: string;
        hashtags: string[];
        accountId: string | null;
        scheduledAt: string | null;
        status: string;
      };

    if (!caption || caption.trim().length === 0) {
      return NextResponse.json({ error: "Caption likhna zaroori hai" }, { status: 400 });
    }

    const post = await db.post.create({
      data: {
        userId: user.id,
        accountId: accountId || null,
        caption: caption.trim(),
        mediaUrls: JSON.stringify(mediaUrls || []),
        mediaType: mediaType || "image",
        hashtags: JSON.stringify(hashtags || []),
        status: status || (scheduledAt ? "scheduled" : "draft"),
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
      include: { account: true, metrics: true },
    });

    // If publishing now, create metrics + notification
    if ((status || (scheduledAt ? "scheduled" : "draft")) === "published") {
      await db.post.update({
        where: { id: post.id },
        data: { publishedAt: new Date(), status: "published" },
      });
      await db.postMetric.create({
        data: {
          postId: post.id,
          likes: Math.floor(Math.random() * 320) + 20,
          comments: Math.floor(Math.random() * 40) + 2,
          shares: Math.floor(Math.random() * 25),
          reach: Math.floor(Math.random() * 4000) + 300,
          impressions: Math.floor(Math.random() * 6000) + 500,
          saves: Math.floor(Math.random() * 30),
        },
      });
      await db.notification.create({
        data: {
          userId: user.id,
          type: "post_published",
          title: "Post publish ho gaya!",
          message: `Aapka post "${caption.slice(0, 40)}${caption.length > 40 ? "…" : ""}" live ho gaya.`,
          read: false,
        },
      });
    }

    const fresh = await db.post.findUnique({
      where: { id: post.id },
      include: { account: true, metrics: true },
    });
    return NextResponse.json({ post: fresh });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Post create nahi ho saka" },
      { status: 500 }
    );
  }
}
