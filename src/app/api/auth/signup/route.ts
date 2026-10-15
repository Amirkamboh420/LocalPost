import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, businessName } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email aur password zaroori hain" },
        { status: 400 }
      );
    }
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Yeh email pehle se registered hai. Login karein." },
        { status: 409 }
      );
    }
    const user = await db.user.create({
      data: {
        email,
        name: name || null,
        businessName: businessName || null,
        passwordHash: hashPassword(password),
        plan: "free",
        timezone: "Asia/Karachi",
      },
    });

    // welcome notification
    await db.notification.create({
      data: {
        userId: user.id,
        type: "welcome",
        title: "LocalPost mein khush aamdeed!",
        message:
          "Apna pehla post schedule karein. Demo accounts pehle se connected hain.",
        read: false,
      },
    });

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
      { error: e?.message || "Signup fail ho gaya" },
      { status: 500 }
    );
  }
}
