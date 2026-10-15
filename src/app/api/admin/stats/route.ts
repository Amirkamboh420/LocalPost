import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Admin platform-wide stats
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = user.role === "owner" || user.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });

  const [users, posts, accounts, tickets, publishedPosts] = await Promise.all([
    db.user.count(),
    db.post.count(),
    db.account.count(),
    db.supportTicket.count(),
    db.post.count({ where: { status: "published" } }),
  ]);

  const [proUsers, agencyUsers, freeUsers] = await Promise.all([
    db.user.count({ where: { plan: "pro" } }),
    db.user.count({ where: { plan: "agency" } }),
    db.user.count({ where: { plan: "free" } }),
  ]);

  const [openTickets, resolvedTickets] = await Promise.all([
    db.supportTicket.count({ where: { status: "open" } }),
    db.supportTicket.count({ where: { status: "resolved" } }),
  ]);

  // last 7 days new users
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newThisWeek = await db.user.count({ where: { createdAt: { gte: weekAgo } } });

  return NextResponse.json({
    users,
    posts,
    accounts,
    tickets,
    publishedPosts,
    planBreakdown: { free: freeUsers, pro: proUsers, agency: agencyUsers },
    ticketsBreakdown: { open: openTickets, resolved: resolvedTickets },
    newThisWeek,
  });
}
