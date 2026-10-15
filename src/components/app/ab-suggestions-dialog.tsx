"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FlaskConical,
  Loader2,
  Sparkles,
  Copy,
  Pencil,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { useApp } from "@/store/app-store";
import { cn } from "@/lib/utils";

interface TestIdea {
  testName: string;
  hypothesis: string;
  variation: string;
  metric: string;
  expectedLift: number;
}

interface SuggestionData {
  tests: TestIdea[];
  insight: string;
  fallback?: boolean;
}

const METRIC_COLORS: Record<string, string> = {
  reach: "bg-saffron/15 text-[#b07300]",
  likes: "bg-red-50 text-red-600",
  comments: "bg-blue-50 text-blue-600",
  saves: "bg-purple-50 text-purple-600",
};

export function ABSuggestionsDialog({
  open,
  onOpenChange,
  postId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  postId: string;
}) {
  const [data, setData] = useState<SuggestionData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !postId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch("/api/ab-suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, postId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto scroll-area-brand">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-saffron" /> A/B test suggestions
          </DialogTitle>
          <DialogDescription>
            AI is post ko improve karne ke liye test variations suggest karta hai.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-saffron animate-spin" />
            <p className="text-sm text-[#6b6b73]">Test ideas generate ho rahe hain…</p>
          </div>
        ) : !data ? (
          <p className="text-sm text-[#6b6b73] py-8 text-center">Data load nahi ho saka.</p>
        ) : (
          <div className="space-y-4 mt-2">
            {/* insight */}
            {data.insight && (
              <div className="rounded-xl border border-saffron/30 bg-[#fff5e6] p-3 flex items-start gap-2.5">
                <Lightbulb className="h-4 w-4 text-saffron shrink-0 mt-0.5" />
                <p className="text-xs text-[#14213d] leading-relaxed">{data.insight}</p>
              </div>
            )}

            {/* test ideas */}
            {data.tests.length > 0 ? (
              <div className="space-y-3">
                {data.tests.map((t, i) => (
                  <div key={i} className="rounded-xl border border-[#e5e5e5] p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="grid place-items-center h-6 w-6 rounded-full gradient-saffron text-[#14213d] text-xs font-bold">
                          {i + 1}
                        </span>
                        <h4 className="text-sm font-bold text-[#14213d]">{t.testName}</h4>
                      </div>
                      <Badge className={cn("border-0 text-[10px] capitalize", METRIC_COLORS[t.metric] || "bg-[#f4f4f5] text-[#6b6b73]")}>
                        {t.metric}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#6b6b73] mb-2.5 leading-relaxed">{t.hypothesis}</p>
                    <div className="rounded-lg bg-[#fafafa] border border-[#e5e5e5] p-2.5 mb-2.5">
                      <p className="text-xs text-[#14213d] leading-relaxed whitespace-pre-wrap">{t.variation}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <TrendingUp className="h-3.5 w-3.5" />
                        ~{t.expectedLift}% expected lift
                      </span>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[#6b6b73] hover:bg-[#fafafa]"
                          onClick={() => {
                            navigator.clipboard.writeText(t.variation);
                            toast.success("Variation copy ho gaya");
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          className="gradient-saffron text-[#14213d] font-semibold h-7"
                          onClick={() => {
                            // create a draft with the variation
                            fetch("/api/posts", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                caption: t.variation,
                                mediaUrls: [],
                                mediaType: "text",
                                hashtags: [],
                                accountId: null,
                                scheduledAt: null,
                                status: "draft",
                              }),
                            })
                              .then((r) => r.json())
                              .then((d) => {
                                if (d.post) {
                                  useApp.getState().upsertPost(d.post);
                                  toast.success("Variation draft mein save ho gaya");
                                }
                              });
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" /> Test
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Sparkles className="h-10 w-10 mx-auto text-[#6b6b73]/40 mb-2" />
                <p className="text-sm text-[#6b6b73]">Koi test ideas generate nahi hue.</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
