import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { getUserAccounts } from "@/lib/data";
import type { Platform } from "@/lib/types";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accounts = await getUserAccounts(user.id);
  return NextResponse.json({ accounts });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { platform } = (await req.json()) as { platform: Platform };
    const valid: Platform[] = ["instagram", "facebook", "twitter", "linkedin", "tiktok"];
    if (!valid.includes(platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    // mock OAuth — generate a handle + random followers for demo
    const handles: Record<Platform, string[]> = {
      instagram: ["urban.boutique.pk", "foodie.lahore", "crafts.studio"],
      facebook: ["Urban Boutique PK", "Lahore Foodies", "Crafts Studio"],
      twitter: ["urbanboutique", "foodie_lhr"],
      linkedin: ["urban-boutique"],
      tiktok: ["urban.boutique", "foodielhr"],
    };
    const displayNames: Record<Platform, string> = {
      instagram: "Instagram",
      facebook: "Facebook",
      twitter: "X / Twitter",
      linkedin: "LinkedIn",
      tiktok: "TikTok",
    };
    const handleList = handles[platform];
    const handle = handleList[Math.floor(Math.random() * handleList.length)];
    const followers = Math.floor(Math.random() * 8000) + 400;

    const account = await db.account.create({
      data: {
        userId: user.id,
        platform,
        handle,
        displayName: displayNames[platform],
        followers,
        connected: true,
      },
    });
    return NextResponse.json({ account });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
