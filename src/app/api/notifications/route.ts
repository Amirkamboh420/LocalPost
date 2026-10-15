import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { getUserNotifications } from "@/lib/data";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const notifications = await getUserNotifications(user.id);
  return NextResponse.json({ notifications });
}

export async function PATCH() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await db.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  const notifications = await getUserNotifications(user.id);
  return NextResponse.json({ notifications });
}
