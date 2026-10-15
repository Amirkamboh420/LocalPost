import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Admin user management — list all users (admin/owner only)
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = user.role === "owner" || user.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });

  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";

  const where = search
    ? {
        OR: [
          { email: { contains: search } },
          { name: { contains: search } },
          { businessName: { contains: search } },
        ],
      }
    : {};

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      name: true,
      businessName: true,
      plan: true,
      role: true,
      createdAt: true,
    },
  });

  // attach post counts per user
  const userIds = users.map((u) => u.id);
  const postCounts = await db.post.groupBy({
    by: ["userId"],
    where: { userId: { in: userIds } },
    _count: { id: true },
  });
  const countMap: Record<string, number> = {};
  for (const pc of postCounts) countMap[pc.userId] = pc._count.id;

  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      postCount: countMap[u.id] || 0,
      createdAt: u.createdAt.toISOString(),
    })),
  });
}

// Admin can suspend a user (set role to "viewer" + plan "free" as a soft-suspend demo)
export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = user.role === "owner" || user.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });

  const { userId, role, plan } = (await req.json()) as { userId: string; role?: string; plan?: string };

  if (!userId) return NextResponse.json({ error: "userId zaroori hai" }, { status: 400 });

  const updates: any = {};
  if (role && ["owner", "admin", "editor", "viewer"].includes(role)) updates.role = role;
  if (plan && ["free", "pro", "agency"].includes(plan)) updates.plan = plan;

  const updated = await db.user.update({ where: { id: userId }, data: updates });
  return NextResponse.json({
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      plan: updated.plan,
      role: updated.role,
    },
  });
}
