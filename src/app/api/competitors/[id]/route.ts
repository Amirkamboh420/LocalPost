import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const competitor = await db.competitor.findUnique({ where: { id } });
  if (!competitor || competitor.userId !== user.id) {
    return NextResponse.json({ error: "Competitor nahi mila" }, { status: 404 });
  }

  await db.competitor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
