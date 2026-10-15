import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import ZAI from "z-ai-web-dev-sdk";

// AI content ideas generator — suggests post topics based on business niche + season
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { niche, business, season } = (await req.json()) as {
      niche: string;
      business?: string;
      season?: string;
    };

    if (!niche?.trim()) {
      return NextResponse.json({ error: "Business niche zaroori hai" }, { status: 400 });
    }

    const zai = await ZAI.create();
    const biz = business?.trim() || user.businessName || "a business";
    const seasonCtx = season?.trim() ? `Current season/context: ${season}.` : "Consider current Pakistani season/festival context.";

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content: `Aap ek expert social media content strategist ho jo Pakistani / South Asian small businesses ke liye ideas dete ho. Roman Urdu + English mix mein ideas do. Har idea actionable + specific ho (not generic). Sirf JSON return karo, koi extra text nahi.`,
        },
        {
          role: "user",
          content: `"${biz}" — niche: ${niche}. ${seasonCtx}\n\n10 content ideas do jo next 2 hafton ke liye use ho sakein. Har idea mein:\n- title (short)\n- angle (kya perspective se post banaye — e.g. behind-the-scenes, testimonial, sale)\n- caption hint (1 line idea of what the caption could be)\n- suggestedType (image | carousel | reel | story)\n- bestDay (which weekday is best)\n\nStrict JSON:\n{\n  "ideas": [\n    { "title": "...", "angle": "...", "captionHint": "...", "suggestedType": "image|carousel|reel|story", "bestDay": "Mon" }\n  ],\n  "contentPillars": ["pillar1", "pillar2", ...],\n  "weeklyTip": "one line tip"\n}`,
        },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    try {
      const cleaned = raw.replace(/```json\s*/i, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({
        ideas: Array.isArray(parsed.ideas) ? parsed.ideas.slice(0, 10) : [],
        contentPillars: Array.isArray(parsed.contentPillars) ? parsed.contentPillars : [],
        weeklyTip: parsed.weeklyTip || "",
      });
    } catch {
      return NextResponse.json({
        ideas: [],
        contentPillars: [],
        weeklyTip: raw.slice(0, 200),
        fallback: true,
      });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Ideas generate nahi hue" }, { status: 500 });
  }
}
