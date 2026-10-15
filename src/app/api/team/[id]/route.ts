import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const member = await db.teamMember.findUnique({ where: { id } });
  if (!member || member.ownerId !== user.id) {
    return NextResponse.json({ error: "Member nahi mila" }, { status: 404 });
  }

  const body = await req.json();
  const updates: any = {};
  if (body.role && ["admin", "editor", "viewer"].includes(body.role)) {
    updates.role = body.role;
  }
  if (body.status && ["invited", "active"].includes(body.status)) {
    updates.status = body.status;
  }

  const updated = await db.teamMember.update({ where: { id }, data: updates });
  return NextResponse.json({ member: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const member = await db.teamMember.findUnique({ where: { id } });
  if (!member || member.ownerId !== user.id) {
    return NextResponse.json({ error: "Member nahi mila" }, { status: 404 });
  }

  await db.teamMember.update({ where: { id }, data: { status: "removed" } });
  return NextResponse.json({ ok: true });
}
