import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET: list tickets (users see their own, admins see all)
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const all = url.searchParams.get("all") === "1";
  const isAdmin = user.role === "owner" || user.role === "admin";

  const where = isAdmin && all ? {} : { userId: user.id };
  const tickets = await db.supportTicket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    tickets: tickets.map((t) => ({
      id: t.id,
      userId: t.userId,
      userEmail: t.userEmail,
      userName: t.userName,
      subject: t.subject,
      category: t.category,
      priority: t.priority,
      message: t.message,
      status: t.status,
      reply: t.reply,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
  });
}

// POST: create a new support ticket
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { subject, category, priority, message } = (await req.json()) as {
      subject: string;
      category: string;
      priority: string;
      message: string;
    };

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Subject aur message zaroori hain" }, { status: 400 });
    }
    const validCategories = ["billing", "technical", "feature_request", "account", "other"];
    const validPriorities = ["low", "normal", "high", "urgent"];

    const ticket = await db.supportTicket.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        userName: user.name || user.businessName || user.email,
        subject: subject.trim(),
        category: validCategories.includes(category) ? category : "other",
        priority: validPriorities.includes(priority) ? priority : "normal",
        message: message.trim(),
        status: "open",
      },
    });

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt.toISOString(),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Ticket create fail" }, { status: 500 });
  }
}
