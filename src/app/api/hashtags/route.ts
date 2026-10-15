import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import ZAI from "z-ai-web-dev-sdk";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { topic, language, count } = (await req.json()) as {
      topic: string;
      language: "english" | "roman-urdu" | "mixed";
      count?: number;
    };

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic likhna zaroori hai" }, { status: 400 });
    }

    const n = Math.min(Math.max(count ?? 15, 5), 30);

    const langInstruction =
      language === "roman-urdu"
        ? "Roman Urdu / Urdu-English mix hashtags (e.g. #KarachiShopping, #PakistaniFashion, #SardiSale) — no pure English-only."
        : language === "mixed"
        ? "A mix of English + Roman Urdu hashtags, plus 3-4 trending generic ones (e.g. #trending, #viral)."
        : "English hashtags only, relevant + trending.";

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content: `Aap ek expert social media hashtag researcher ho jo Pakistani / South Asian businesses ke liye kaam karta hai. ${langInstruction} Sirf valid, reachable, non-banned hashtags do. Local audience (Pakistan, India, Bangladesh) ke liye optimize karo. Koi explanation nahi — sirf JSON return karo.`,
        },
        {
          role: "user",
          content: `Is topic ke liye ${n} hashtags suggest karo:\n\n"${topic}"\n\nStrict JSON format:\n{\n  "hashtags": ["#tag1", "#tag2", ...],\n  "estimatedReach": "low | medium | high | very-high",\n  "bestTimes": "short description of when this audience is most active"\n}`,
        },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    try {
      const cleaned = raw.replace(/```json\s*/i, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({
        hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.slice(0, n) : [],
        estimatedReach: parsed.estimatedReach || "medium",
        bestTimes: parsed.bestTimes || "Evenings 7-9 PM",
      });
    } catch {
      // fallback: extract hashtags via regex
      const tags = raw.match(/#[\w]+/g) || [];
      return NextResponse.json({
        hashtags: tags.slice(0, n),
        estimatedReach: "medium",
        bestTimes: "Evenings 7-9 PM",
        fallback: true,
      });
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Hashtags generate nahi hue" },
      { status: 500 }
    );
  }
}
