import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "viewer") {
    return NextResponse.json({ error: "Forbidden — viewers cannot edit posts" }, { status: 403 });
  }
  const { id } = await params;

  const existing = await db.post.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Post nahi mila" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { caption, mediaUrls, mediaType, hashtags, accountId, scheduledAt, status } =
      body;

    const willPublish = status === "published" && existing.status !== "published";

    const updated = await db.post.update({
      where: { id },
      data: {
        caption: caption?.trim() ?? existing.caption,
        mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : existing.mediaUrls,
        mediaType: mediaType ?? existing.mediaType,
        hashtags: hashtags ? JSON.stringify(hashtags) : existing.hashtags,
        accountId: accountId === undefined ? existing.accountId : accountId || null,
        scheduledAt: scheduledAt === undefined ? existing.scheduledAt : scheduledAt ? new Date(scheduledAt) : null,
        status: status ?? existing.status,
        publishedAt: willPublish ? new Date() : existing.publishedAt,
      },
      include: { account: true, metrics: true },
    });

    if (willPublish) {
      const hasMetrics = await db.postMetric.findUnique({ where: { postId: id } });
      if (!hasMetrics) {
        await db.postMetric.create({
          data: {
            postId: id,
            likes: Math.floor(Math.random() * 320) + 20,
            comments: Math.floor(Math.random() * 40) + 2,
            shares: Math.floor(Math.random() * 25),
            reach: Math.floor(Math.random() * 4000) + 300,
            impressions: Math.floor(Math.random() * 6000) + 500,
            saves: Math.floor(Math.random() * 30),
          },
        });
      }
      await db.notification.create({
        data: {
          userId: user.id,
          type: "post_published",
          title: "Post publish ho gaya!",
          message: `Aapka post live ho gaya.`,
          read: false,
        },
      });
    }

    const fresh = await db.post.findUnique({
      where: { id },
      include: { account: true, metrics: true },
    });
    return NextResponse.json({ post: fresh });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Update fail" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // only admin/owner can delete posts
  if (user.role !== "owner" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden — sirf admin posts delete kar sakte hain" }, { status: 403 });
  }
  const { id } = await params;

  const existing = await db.post.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Post nahi mila" }, { status: 404 });
  }

  await db.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
