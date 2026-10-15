import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

function parsePrefs(raw: string | null | undefined): Record<string, any> {
  if (!raw) return {};
  try {
    const p = JSON.parse(raw);
    return typeof p === "object" && p ? p : {};
  } catch {
    return {};
  }
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const u = await db.user.findUnique({ where: { id: user.id } });
  if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const prefs = parsePrefs(u.prefs);
  return NextResponse.json({
    prefs: {
      emailWeeklyReport: prefs.emailWeeklyReport ?? false,
      emailWeeklyDay: prefs.emailWeeklyDay ?? "monday",
      emailFailed: prefs.emailFailed ?? true,
      emailPublished: prefs.emailPublished ?? false,
      pushNotifs: prefs.pushNotifs ?? true,
      aiSuggestions: prefs.aiSuggestions ?? true,
      weeklyReportTime: prefs.weeklyReportTime ?? "09:00",
    },
  });
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const updates: any = {};
    if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
    if (typeof body.businessName === "string") updates.businessName = body.businessName.trim() || null;
    if (typeof body.timezone === "string" && body.timezone.trim()) updates.timezone = body.timezone.trim();
    if (typeof body.avatar === "string") updates.avatar = body.avatar || null;
    // allow demo role switching (for testing role-based access)
    if (typeof body.role === "string" && ["owner", "admin", "editor", "viewer"].includes(body.role)) {
      updates.role = body.role;
    }

    // merge prefs if provided
    if (body.prefs && typeof body.prefs === "object") {
      const existing = await db.user.findUnique({ where: { id: user.id } });
      const current = parsePrefs(existing?.prefs);
      const merged = { ...current, ...body.prefs };
      updates.prefs = JSON.stringify(merged);
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: updates,
    });

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      avatar: updated.avatar,
      businessName: updated.businessName,
      timezone: updated.timezone,
      plan: updated.plan,
      role: updated.role,
      createdAt: updated.createdAt.toISOString(),
      prefs: parsePrefs(updated.prefs),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Profile update fail" }, { status: 500 });
  }
}
