"use client";

import { useState } from "react";
import { useApp } from "@/store/app-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Wallet,
  CreditCard,
  Shield,
  Sparkles,
  Zap,
  Building2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { PLAN_META } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PAYMENT_METHODS = [
  { id: "jazzcash", name: "JazzCash", desc: "Mobile wallet", color: "#ED1C24", icon: "📱" },
  { id: "easypaisa", name: "EasyPaisa", desc: "Mobile wallet", color: "#00A551", icon: "💚" },
  { id: "bank", name: "Bank Transfer", desc: "IBAN transfer", color: "#14213D", icon: "🏦" },
  { id: "stripe", name: "Card (Stripe)", desc: "International", color: "#635BFF", icon: "💳" },
];

const FEATURES: Record<string, string[]> = {
  free: ["1 social account", "10 posts / month", "Basic analytics", "Calendar view", "Community support"],
  pro: ["5 social accounts", "Unlimited posts", "AI captions (Roman Urdu)", "Advanced analytics", "Best time to post", "Hashtag suggestions", "Priority support"],
  agency: ["Unlimited accounts", "5 team seats", "Approval workflow", "White-label option", "Bulk upload (CSV)", "Content library", "Dedicated manager"],
};

export function BillingView() {
  const user = useApp((s) => s.user);
  const setUser = useApp((s) => s.setUser);
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "agency">("pro");
  const [selectedMethod, setSelectedMethod] = useState("jazzcash");
  const [processing, setProcessing] = useState(false);

  async function handleUpgrade() {
    setProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      if (user) setUser({ ...user, plan: selectedPlan });
      toast.success(`${PLAN_META[selectedPlan].label} plan activate ho gaya! 🎉`);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      {/* current plan banner */}
      <div className="relative overflow-hidden rounded-2xl gradient-navy p-6 text-white">
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-saffron/30 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/60 font-bold">Current plan</div>
            <div className="mt-1 flex items-center gap-3">
              <h2 className="text-3xl font-extrabold capitalize">{user?.plan} plan</h2>
              <Badge className="bg-saffron text-[#14213d] border-0 capitalize">{user?.plan}</Badge>
            </div>
            <p className="text-sm text-white/70 mt-1">
              {user?.plan === "free"
                ? "1 account · 10 posts/month"
                : user?.plan === "pro"
                ? "5 accounts · Unlimited posts · AI captions"
                : "Unlimited accounts · Team collaboration"}
            </p>
          </div>
          {user?.plan !== "free" && (
            <div className="text-right">
              <div className="text-2xl font-bold">Rs. {PLAN_META[user!.plan].price.toLocaleString()}</div>
              <div className="text-xs text-white/60">/month · Next billing: {nextMonth()}</div>
            </div>
          )}
        </div>
      </div>

      {/* plans */}
      <div>
        <h2 className="text-lg font-bold text-[#14213d] mb-1">Plan choose karein</h2>
        <p className="text-sm text-[#6b6b73] mb-4">Cancel anytime. 14-day money-back guarantee.</p>
        <div className="grid md:grid-cols-3 gap-4">
          {(["free", "pro", "agency"] as const).map((plan) => {
            const meta = PLAN_META[plan];
            const isCurrent = user?.plan === plan;
            const isUpgrade = plan !== "free" && plan !== user?.plan;
            return (
              <Card
                key={plan}
                className={cn(
                  "border p-5 relative",
                  plan === "pro" ? "border-saffron shadow-brand bg-[#fffdf8]" : "border-[#e5e5e5]",
                  selectedPlan === plan && isUpgrade && "ring-2 ring-saffron"
                )}
              >
                {plan === "pro" && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-saffron text-[#14213d] font-bold border-0">
                    Popular
                  </Badge>
                )}
                <div className="flex items-center gap-2 mb-1">
                  {plan === "free" ? <Zap className="h-5 w-5 text-[#6b6b73]" /> :
                   plan === "pro" ? <Sparkles className="h-5 w-5 text-saffron" /> :
                   <Building2 className="h-5 w-5 text-[#14213d]" />}
                  <span className="text-lg font-bold text-[#14213d]">{meta.label}</span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-extrabold text-[#14213d]">
                    Rs. {meta.price === 0 ? 0 : meta.price.toLocaleString()}
                  </span>
                  {meta.price > 0 && <span className="text-sm text-[#6b6b73] mb-1">/mo</span>}
                </div>
                <div className="mt-4 space-y-2.5">
                  {FEATURES[plan].map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-saffron shrink-0 mt-0.5" />
                      <span className="text-[#14213d]">{f}</span>
                    </div>
                  ))}
                </div>
                <Button
                  disabled={isCurrent}
                  onClick={() => {
                    if (isUpgrade) {
                      setSelectedPlan(plan);
                      document.getElementById("payment-section")?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className={cn(
                    "w-full mt-5 font-semibold",
                    isCurrent
                      ? "bg-[#f4f4f5] text-[#6b6b73] cursor-default"
                      : plan === "pro"
                      ? "gradient-saffron text-[#14213d] hover:opacity-90"
                      : "bg-[#14213d] text-white hover:bg-[#14213d]/90"
                  )}
                >
                  {isCurrent ? (
                    <><CheckCircle2 className="h-4 w-4" /> Current plan</>
                  ) : isUpgrade ? (
                    `Upgrade to ${meta.label}`
                  ) : (
                    "Downgrade"
                  )}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* payment methods */}
      <Card id="payment-section" className="border-[#e5e5e5]">
        <CardContent className="p-6">
          <h3 className="text-base font-bold text-[#14213d] flex items-center gap-2 mb-1">
            <Wallet className="h-4 w-4 text-saffron" />
            Payment method
          </h3>
          <p className="text-sm text-[#6b6b73] mb-4">
            Local payments support — JazzCash, EasyPaisa aur bank transfer. USD ke jhanjhat nahi.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={cn(
                  "flex items-center gap-3 p-3.5 rounded-xl border-2 transition-colors text-left",
                  selectedMethod === m.id
                    ? "border-saffron bg-[#fffdf8]"
                    : "border-[#e5e5e5] hover:border-[#6b6b73]/40"
                )}
              >
                <div
                  className="grid place-items-center h-10 w-10 rounded-lg text-white text-lg"
                  style={{ backgroundColor: m.color }}
                >
                  {m.icon}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[#14213d] text-sm">{m.name}</div>
                  <div className="text-xs text-[#6b6b73]">{m.desc}</div>
                </div>
                {selectedMethod === m.id && (
                  <CheckCircle2 className="h-5 w-5 text-saffron" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-xl bg-[#fafafa] p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-[#6b6b73]">Amount due today</div>
              <div className="text-2xl font-extrabold text-[#14213d]">
                Rs. {PLAN_META[selectedPlan].price.toLocaleString()}
              </div>
              <div className="text-xs text-[#6b6b73]">{PLAN_META[selectedPlan].label} plan · monthly</div>
            </div>
            <Button
              onClick={handleUpgrade}
              disabled={processing}
              className="gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand h-12 px-6"
            >
              {processing ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
              ) : (
                <>Pay & activate</>
              )}
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-[#6b6b73]">
            <Shield className="h-3.5 w-3.5 text-saffron" />
            Secure payment · 256-bit encryption · PCI compliant
          </div>
        </CardContent>
      </Card>

      {/* billing history */}
      <Card className="border-[#e5e5e5]">
        <CardContent className="p-6">
          <h3 className="text-base font-bold text-[#14213d] mb-3">Billing history</h3>
          {user?.plan === "free" ? (
            <div className="text-sm text-[#6b6b73] text-center py-6">
              Abhi koi transaction nahi. Upgrade karne ke baad yahan dikhega.
            </div>
          ) : (
            <div className="space-y-2">
              {[
                { date: "01 Dec 2024", plan: "Pro", amount: "Rs. 1,490", method: "JazzCash" },
                { date: "01 Nov 2024", plan: "Pro", amount: "Rs. 1,490", method: "JazzCash" },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[#e5e5e5]">
                  <div className="flex items-center gap-3">
                    <div className="grid place-items-center h-8 w-8 rounded-lg bg-emerald-50">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#14213d]">{t.plan} plan</div>
                      <div className="text-xs text-[#6b6b73]">{t.date} · {t.method}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#14213d]">{t.amount}</div>
                    <button className="text-xs text-saffron hover:underline">Invoice</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function nextMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}
