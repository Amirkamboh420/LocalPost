import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import ZAI from "z-ai-web-dev-sdk";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { topic, tone, language } = (await req.json()) as {
      topic: string;
      tone: string;
      language: "english" | "roman-urdu" | "both";
    };

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic likhna zaroori hai" }, { status: 400 });
    }

    const zai = await ZAI.create();

    const langInstruction =
      language === "both"
        ? "Do captions English mein aur do Roman Urdu (Urdu in Roman script, like 'Aaj ka special offer!') mein likhein."
        : language === "roman-urdu"
        ? "Saari captions Roman Urdu mein likhein (Urdu written in English/Roman letters, e.g. 'Naya collection aa gaya hai!')."
        : "Write all captions in English.";

    const toneInstruction =
      tone === "professional"
        ? "Professional aur polished tone."
        : tone === "casual"
        ? "Friendly aur casual tone, thori mazak mixed."
        : tone === "promotional"
        ? "Promotional aur sales-focused tone with clear CTA."
        : tone === "storytelling"
        ? "Storytelling tone, emotional hook ke saath."
        : "Friendly tone.";

    const systemPrompt = `Aap ek expert social media copywriter ho jo Pakistani / South Asian small businesses ke liye likhta hai. ${toneInstruction} ${langInstruction} Har caption engaging ho, emojis use karo (2-4 per caption), aur relevant hashtags end par add karo. Captions Instagram aur Facebook ke liye optimize karo.`;

    const userPrompt = `Is topic/product ke liye 4 alag alag caption options likho:\n\n"${topic}"\n\nStrict JSON format mein reply karo, koi extra text nahi:\n{\n  "captions": [\n    { "text": "...", "language": "english" | "roman-urdu" },\n    ...\n  ],\n  "hashtags": ["#tag1", "#tag2", ...]\n}\n\nHashtags ki list 10-12 relevant tags do (Pakistani/local + general mix).`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    // try to parse JSON, tolerate code fences
    let parsed: { captions: { text: string; language: string }[]; hashtags: string[] } | null = null;
    try {
      const cleaned = raw
        .replace(/```json\s*/i, "")
        .replace(/```\s*/g, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // fall back: return raw text as a single caption
      return NextResponse.json({
        captions: [{ text: raw.trim(), language: "english" }],
        hashtags: [],
        fallback: true,
      });
    }

    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Caption generate nahi ho sake" },
      { status: 500 }
    );
  }
}
