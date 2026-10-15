import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

// AI recommends A/B test variations for a post — what to test to improve engagement.
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { postId } = (await req.json()) as { postId: string };

    if (!postId) {
      return NextResponse.json({ error: "postId zaroori hai" }, { status: 400 });
    }

    const post = await db.post.findUnique({
      where: { id: postId },
      include: { metrics: true, account: true },
    });
    if (!post || post.userId !== user.id) {
      return NextResponse.json({ error: "Post nahi mila" }, { status: 404 });
    }

    const zai = await ZAI.create();
    const hasMedia = post.mediaUrls && JSON.parse(post.mediaUrls || "[]").length > 0;
    const engRate = post.metrics && post.metrics.impressions > 0
      ? (((post.metrics.likes + post.metrics.comments + post.metrics.shares) / post.metrics.impressions) * 100).toFixed(1)
      : "0";

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content: `Aap ek expert social media strategist ho jo Pakistani/South Asian businesses ke liye A/B test recommendations deta hai. Roman Urdu + English mix mein. Sirf JSON return karo, koi extra text nahi.`,
        },
        {
          role: "user",
          content: `Is published post ke liye A/B test variations suggest karo:\n\nCaption: "${post.caption}"\nHas media: ${hasMedia ? "yes" : "no"}\nCurrent engagement rate: ${engRate}%\n\n4 test ideas do, har ek mein:\n- testName (short, e.g. "Different hook")\n- hypothesis (kya improve hoga)\n- variation: the actual alternative caption/element to test (full text)\n- metric: which metric to watch (reach/likes/comments/saves)\n- expectedLift: estimated % improvement\n\nStrict JSON:\n{\n  "tests": [\n    { "testName": "...", "hypothesis": "...", "variation": "...", "metric": "reach|likes|comments|saves", "expectedLift": 15 }\n  ],\n  "insight": "one line about why this post performed the way it did"\n}`,
        },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    try {
      const cleaned = raw.replace(/```json\s*/i, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({
        tests: Array.isArray(parsed.tests) ? parsed.tests.slice(0, 4) : [],
        insight: parsed.insight || "",
      });
    } catch {
      return NextResponse.json({
        tests: [],
        insight: raw.slice(0, 200),
        fallback: true,
      });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Suggestions generate nahi hue" }, { status: 500 });
  }
}
