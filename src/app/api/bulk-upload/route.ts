import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { mapPost } from "@/lib/data";

// CSV bulk upload
// Expected header: caption,platform,datetime,mediaUrl,hashtags
// platform: instagram | facebook | twitter | linkedin | tiktok
// datetime: ISO or "YYYY-MM-DD HH:mm"
// mediaUrl: optional single URL
// hashtags: optional comma-separated

function parseCSV(text: string) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const cells: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') inQuotes = !inQuotes;
      else if (ch === "," && !inQuotes) {
        cells.push(cur.trim());
        cur = "";
      } else cur += ch;
    }
    cells.push(cur.trim());
    return cells;
  });
  return { headers, rows };
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { csv } = (await req.json()) as { csv: string };
    if (!csv?.trim()) {
      return NextResponse.json({ error: "CSV content zaroori hai" }, { status: 400 });
    }

    const { headers, rows } = parseCSV(csv);
    if (!headers.includes("caption")) {
      return NextResponse.json(
        { error: "CSV mein 'caption' column zaroori hai. Headers: caption,platform,datetime,mediaUrl,hashtags" },
        { status: 400 }
      );
    }

    // resolve user accounts for platform matching
    const accounts = await db.account.findMany({ where: { userId: user.id } });
    const accountByPlatform: Record<string, string> = {};
    for (const a of accounts) accountByPlatform[a.platform] = a.id;

    const created: any[] = [];
    const errors: { row: number; error: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const get = (key: string) => {
          const idx = headers.indexOf(key);
          return idx >= 0 ? row[idx] : "";
        };
        const caption = get("caption");
        if (!caption) {
          errors.push({ row: i + 2, error: "Caption khali hai" });
          continue;
        }
        const platform = get("platform") || "instagram";
        const datetime = get("datetime");
        const mediaUrl = get("mediaurl");
        const hashtagsRaw = get("hashtags");

        let scheduledAt: Date | null = null;
        if (datetime) {
          const d = new Date(datetime.replace(" ", "T"));
          if (isNaN(d.getTime())) {
            errors.push({ row: i + 2, error: `Invalid datetime: ${datetime}` });
            continue;
          }
          scheduledAt = d;
        }

        const hashtags = hashtagsRaw
          ? hashtagsRaw.split(/[;,]/).map((t) => t.trim().replace(/^#/, "")).filter(Boolean)
          : [];
        const mediaUrls = mediaUrl ? [mediaUrl] : [];

        const post = await db.post.create({
          data: {
            userId: user.id,
            accountId: accountByPlatform[platform] || null,
            caption,
            mediaUrls: JSON.stringify(mediaUrls),
            mediaType: mediaUrl ? "image" : "text",
            hashtags: JSON.stringify(hashtags),
            status: scheduledAt ? "scheduled" : "draft",
            scheduledAt,
          },
          include: { account: true, metrics: true },
        });
        created.push(mapPost(post));
      } catch (e: any) {
        errors.push({ row: i + 2, error: e.message });
      }
    }

    return NextResponse.json({
      created: created.length,
      errors,
      posts: created,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Bulk upload fail" }, { status: 500 });
  }
}
