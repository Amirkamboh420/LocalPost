import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Send weekly report email (simulated — logs to notifications).
// In production this would integrate with Resend/SendGrid.
export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [posts, accounts] = await Promise.all([
    db.post.findMany({
      where: { userId: user.id, status: "published", publishedAt: { gte: weekAgo } },
      include: { metrics: true, account: true },
    }),
    db.account.findMany({ where: { userId: user.id } }),
  ]);

  const totalReach = posts.reduce((s, p) => s + (p.metrics?.reach ?? 0), 0);
  const totalLikes = posts.reduce((s, p) => s + (p.metrics?.likes ?? 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.metrics?.comments ?? 0), 0);
  const totalFollowers = accounts.reduce((s, a) => s + a.followers, 0);

  // Create an in-app "email sent" notification with the digest
  const summary = `Weekly digest: ${posts.length} posts, ${totalReach} reach, ${totalLikes} likes, ${totalComments} comments across ${accounts.length} accounts (${totalFollowers} followers).`;

  await db.notification.create({
    data: {
      userId: user.id,
      type: "system",
      title: "Weekly report emailed 📧",
      message: summary,
      read: false,
    },
  });

  return NextResponse.json({
    sent: true,
    to: user.email,
    summary: {
      posts: posts.length,
      reach: totalReach,
      likes: totalLikes,
      comments: totalComments,
      followers: totalFollowers,
      accounts: accounts.length,
    },
    note: "Email sending simulated — in production this would send via Resend/SendGrid.",
  });
}
