import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const AVATAR_COLORS = ["#fca311", "#14213d", "#e5484d", "#1877f2", "#10b981", "#8b5cf6", "#ec4899"];

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const members = await db.teamMember.findMany({
    where: { ownerId: user.id, status: { not: "removed" } },
    orderBy: { createdAt: "asc" },
  });

  // Include the owner as an "admin" member at the top
  const ownerEntry = {
    id: "owner",
    email: user.email,
    name: user.name || user.businessName || "Owner",
    role: "admin",
    status: "active",
    avatarColor: "#fca311",
    createdAt: new Date().toISOString(),
    isOwner: true,
  };

  return NextResponse.json({
    members: [
      ownerEntry,
      ...members.map((m) => ({
        id: m.id,
        email: m.email,
        name: m.name,
        role: m.role,
        status: m.status,
        avatarColor: m.avatarColor,
        createdAt: m.createdAt.toISOString(),
        isOwner: false,
      })),
    ],
  });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { email, name, role } = (await req.json()) as {
      email: string;
      name: string;
      role: "admin" | "editor" | "viewer";
    };

    if (!email?.trim() || !name?.trim()) {
      return NextResponse.json({ error: "Email aur naam zaroori hain" }, { status: 400 });
    }
    const validRoles = ["admin", "editor", "viewer"];
    const finalRole = validRoles.includes(role) ? role : "editor";

    // limit based on plan
    const count = await db.teamMember.count({ where: { ownerId: user.id, status: { not: "removed" } } });
    const limit = user.plan === "agency" ? 10 : user.plan === "pro" ? 3 : 0;
    if (limit === 0) {
      return NextResponse.json(
        { error: "Team members Pro ya Agency plan mein available hain. Upgrade karein." },
        { status: 403 }
      );
    }
    if (count >= limit) {
      return NextResponse.json(
        { error: `Aap ke plan mein ${limit} team members allowed hain. Upgrade for more.` },
        { status: 403 }
      );
    }

    const member = await db.teamMember.create({
      data: {
        ownerId: user.id,
        email: email.trim(),
        name: name.trim(),
        role: finalRole,
        status: "invited",
        avatarColor: AVATAR_COLORS[count % AVATAR_COLORS.length],
      },
    });

    return NextResponse.json({
      member: {
        id: member.id,
        email: member.email,
        name: member.name,
        role: member.role,
        status: member.status,
        avatarColor: member.avatarColor,
        createdAt: member.createdAt.toISOString(),
        isOwner: false,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Invite fail" }, { status: 500 });
  }
}
