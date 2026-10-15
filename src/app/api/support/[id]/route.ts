import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// PATCH: admin updates ticket status / reply
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = user.role === "owner" || user.role === "admin";
  const { id } = await params;

  const ticket = await db.supportTicket.findUnique({ where: { id } });
  if (!ticket) return NextResponse.json({ error: "Ticket nahi mila" }, { status: 404 });

  // non-admins can only close their own tickets
  if (!isAdmin && ticket.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updates: any = {};
  const validStatus = ["open", "in_progress", "resolved", "closed"];
  if (body.status && validStatus.includes(body.status)) updates.status = body.status;
  if (typeof body.reply === "string" && body.reply.trim()) {
    if (!isAdmin) return NextResponse.json({ error: "Sirf admin reply kar sakte hain" }, { status: 403 });
    updates.reply = body.reply.trim();
    if (ticket.status === "open") updates.status = "in_progress";
  }

  const updated = await db.supportTicket.update({ where: { id }, data: updates });
  return NextResponse.json({
    ticket: {
      id: updated.id,
      status: updated.status,
      reply: updated.reply,
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}
