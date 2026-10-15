import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, setSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email aur password zaroori hain" },
        { status: 400 }
      );
    }
    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Email ya password ghalat hai" },
        { status: 401 }
      );
    }
    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Email ya password ghalat hai" },
        { status: 401 }
      );
    }
    await setSession(user.id);
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      businessName: user.businessName,
      timezone: user.timezone,
      plan: user.plan,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Login fail ho gaya" },
      { status: 500 }
    );
  }
}
