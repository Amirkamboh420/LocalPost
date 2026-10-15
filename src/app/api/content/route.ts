import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await db.contentItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    items: items.map((i) => ({
      id: i.id,
      userId: i.userId,
      type: i.type,
      title: i.title,
      url: i.url,
      content: i.content,
      tags: i.tags,
      createdAt: i.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { type, title, url, content, tags } = await req.json();
  if (!type || !title) {
    return NextResponse.json({ error: "Type aur title zaroori hain" }, { status: 400 });
  }
  const item = await db.contentItem.create({
    data: {
      userId: user.id,
      type,
      title,
      url: url || null,
      content: content || null,
      tags: tags || null,
    },
  });
  return NextResponse.json({ item });
}
