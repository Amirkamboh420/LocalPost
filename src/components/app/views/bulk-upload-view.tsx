"use client";

import { useState } from "react";
import { useApp } from "@/store/app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  X,
} from "lucide-react";
import { EmptyState } from "@/components/app/shared";
import type { Post } from "@/lib/types";

const SAMPLE_CSV = `caption,platform,datetime,mediaUrl,hashtags
"Naya winter collection aa gaya! 🧥 25% off. Order karein abhi.","instagram",2026-10-15 19:00,https://picsum.photos/seed/bulk1/800/800,"WinterSale,PakistaniFashion,Karachi"
"Weekend flash sale! Sirf 3 hours.","facebook",2026-10-16 20:00,https://picsum.photos/seed/bulk2/800/800,"FlashSale,WeekendOffer"
"Customer review of the week ❤️","instagram",2026-10-17 14:00,https://picsum.photos/seed/bulk3/800/800,"CustomerLove,Review"
"Monday motivation! Naye goals. 💪","twitter",2026-10-20 09:00,,"MondayMotivation,Hustle"`;

export function BulkUploadView() {
  const [csv, setCsv] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    errors: { row: number; error: string }[];
    posts: Post[];
  } | null>(null);
  const upsertPost = useApp((s) => s.upsertPost);
  const setView = useApp((s) => s.setView);

  async function handleUpload() {
    if (!csv.trim()) {
      toast.error("Pehle CSV paste karein ya sample load karein");
      return;
    }
    setUploading(true);
    try {
      const res = await fetch("/api/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      data.posts?.forEach((p: Post) => upsertPost(p));
      toast.success(`${data.created} posts schedule ho gaye!`);
    } catch (e: any) {
      toast.error(e.message || "Bulk upload fail");
    } finally {
      setUploading(false);
    }
  }

  function loadSample() {
    setCsv(SAMPLE_CSV);
    toast.info("Sample CSV load ho gaya — review karke upload karein");
  }

  function downloadTemplate() {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "localpost-bulk-template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template download ho gaya");
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-[#14213d] flex items-center gap-2">
          <Upload className="h-5 w-5 text-saffron" /> Bulk upload posts
        </h2>
        <p className="text-sm text-[#6b6b73] mt-1">
          CSV se multiple posts ek saath schedule karein. Agency use case ke liye perfect.
        </p>
      </div>

      {/* how it works */}
      <Card className="border-saffron/30 bg-[#fffdf8]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-lg bg-saffron/20 shrink-0">
              <FileSpreadsheet className="h-5 w-5 text-saffron" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-[#14213d]">CSV format</h3>
              <p className="text-xs text-[#6b6b73] mt-0.5">
                Headers (case-insensitive): <code className="bg-white px-1.5 py-0.5 rounded text-[#14213d] font-mono">caption,platform,datetime,mediaUrl,hashtags</code>
              </p>
              <ul className="text-xs text-[#6b6b73] mt-2 space-y-1">
                <li>• <b>caption</b> (required) — post text</li>
                <li>• <b>platform</b> — instagram / facebook / twitter (default: instagram)</li>
                <li>• <b>datetime</b> — YYYY-MM-DD HH:mm (e.g. 2026-10-15 19:00)</li>
                <li>• <b>mediaUrl</b> — optional single image URL</li>
                <li>• <b>hashtags</b> — comma-separated, no # needed</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={downloadTemplate} className="border-[#e5e5e5] text-[#14213d]">
              <Download className="h-3.5 w-3.5" /> Template download
            </Button>
            <Button size="sm" variant="outline" onClick={loadSample} className="border-saffron/40 text-saffron hover:bg-[#fff5e6]">
              <Copy className="h-3.5 w-3.5" /> Sample load karein
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CSV input */}
      <Card className="border-[#e5e5e5]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold">CSV content</CardTitle>
            {csv && (
              <Button size="sm" variant="ghost" onClick={() => setCsv("")} className="text-[#6b6b73] h-7">
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            placeholder="caption,platform,datetime,mediaUrl,hashtags&#10;...apni rows yahan..."
            rows={10}
            className="font-mono text-xs resize-y"
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-[#6b6b73]">
              {csv ? `${csv.split(/\r?\n/).filter((l) => l.trim()).length - 1} rows detected` : "Koi content nahi"}
            </span>
            <Button
              onClick={handleUpload}
              disabled={uploading || !csv.trim()}
              className="gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand"
            >
              {uploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
              ) : (
                <><Upload className="h-4 w-4" /> Schedule all</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* result */}
      {result && (
        <Card className="border-[#e5e5e5]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Upload complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-emerald-50 text-emerald-700 border-0">
                {result.created} scheduled
              </Badge>
              {result.errors.length > 0 && (
                <Badge className="bg-red-50 text-red-600 border-0">
                  {result.errors.length} errors
                </Badge>
              )}
            </div>

            {result.posts.length > 0 && (
              <div className="space-y-2 mb-4">
                <div className="text-xs font-semibold uppercase text-[#6b6b73] mb-2">Scheduled posts</div>
                <div className="max-h-64 overflow-y-auto scroll-area-brand space-y-1.5 pr-1">
                  {result.posts.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg border border-[#e5e5e5] bg-[#fafafa]">
                      <div className="h-1.5 w-1.5 rounded-full bg-saffron shrink-0" />
                      <span className="text-sm text-[#14213d] flex-1 truncate">{p.caption}</span>
                      {p.scheduledAt && (
                        <span className="text-xs text-[#6b6b73] shrink-0">
                          {new Date(p.scheduledAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.errors.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-center gap-2 text-red-700 text-sm font-semibold mb-2">
                  <AlertTriangle className="h-4 w-4" /> Errors
                </div>
                <ul className="text-xs text-red-600 space-y-1">
                  {result.errors.map((e, i) => (
                    <li key={i}>Row {e.row}: {e.error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button onClick={() => setView("calendar")} className="gradient-saffron text-[#14213d] font-semibold">
                Calendar dekhein
              </Button>
              <Button variant="outline" onClick={() => { setResult(null); setCsv(""); }} className="border-[#e5e5e5] text-[#14213d]">
                Aur upload karein
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!result && !csv && (
        <Card className="border-dashed border-[#e5e5e5]">
          <EmptyState
            icon={Upload}
            title="Bulk upload shuru karein"
            desc="Template download karein ya sample load karke test karein. Agency plan mein unlimited posts supported hain."
            action={
              <div className="flex gap-2">
                <Button onClick={downloadTemplate} className="gradient-saffron text-[#14213d] font-semibold">
                  <Download className="h-4 w-4" /> Template
                </Button>
                <Button onClick={loadSample} variant="outline" className="border-saffron/40 text-saffron hover:bg-[#fff5e6]">
                  <Copy className="h-4 w-4" /> Sample load
                </Button>
              </div>
            }
          />
        </Card>
      )}
    </div>
  );
}
