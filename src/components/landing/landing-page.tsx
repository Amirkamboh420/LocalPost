"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Sparkles,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Wallet,
  Zap,
  Clock,
  BarChart3,
  Users,
  Shield,
  CheckCircle2,
  ArrowRight,
  Star,
  Menu,
  X,
  Rocket,
  MessageCircle,
  Globe,
  TrendingUp,
} from "lucide-react";
import { useApp } from "@/store/app-store";
import { AuthModal } from "@/components/auth-modal";
import { Logo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { PLAN_META } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LandingPage() {
  const setAuthModal = useApp((s) => s.setAuthModal);
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AuthModal />

      {/* Top announcement bar */}
      <div className="bg-[#14213d] text-white text-xs sm:text-sm">
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-center gap-2 text-center">
          <span className="hidden sm:inline">🇵🇰 Built for Pakistani & South Asian small businesses</span>
          <span className="sm:hidden">🇵🇰 Built for Pakistan</span>
          <span className="opacity-50">•</span>
          <span className="text-saffron font-medium">
            Launch offer: 50% off Pro plan for 3 months
          </span>
        </div>
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-[#e5e5e5] bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Logo />
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#14213d]">
              <a href="#features" className="hover:text-saffron transition-colors">
                Features
              </a>
              <a href="#how" className="hover:text-saffron transition-colors">
                How it works
              </a>
              <a href="#pricing" className="hover:text-saffron transition-colors">
                Pricing
              </a>
              <a href="#local" className="hover:text-saffron transition-colors">
                Local-first
              </a>
              <a href="#faq" className="hover:text-saffron transition-colors">
                FAQ
              </a>
            </nav>
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                onClick={() => setAuthModal("login")}
                className="text-[#14213d] hover:bg-[#fff5e6]"
              >
                Login
              </Button>
              <Button
                onClick={() => setAuthModal("signup")}
                className="gradient-saffron text-[#14213d] font-semibold shadow-brand hover:opacity-90"
              >
                Free shuru karein
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <button
              className="md:hidden p-2 -mr-2 text-[#14213d]"
              onClick={() => setMobileNav((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileNav ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {mobileNav && (
          <div className="md:hidden border-t border-[#e5e5e5] bg-white px-4 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileNav(false)} className="block py-1.5 font-medium">Features</a>
            <a href="#how" onClick={() => setMobileNav(false)} className="block py-1.5 font-medium">How it works</a>
            <a href="#pricing" onClick={() => setMobileNav(false)} className="block py-1.5 font-medium">Pricing</a>
            <a href="#local" onClick={() => setMobileNav(false)} className="block py-1.5 font-medium">Local-first</a>
            <a href="#faq" onClick={() => setMobileNav(false)} className="block py-1.5 font-medium">FAQ</a>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setAuthModal("login")}>Login</Button>
              <Button className="flex-1 gradient-saffron text-[#14213d] font-semibold" onClick={() => setAuthModal("signup")}>Signup</Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-saffron/20 blur-3xl" />
          <div className="absolute top-40 -left-32 h-96 w-96 rounded-full bg-[#14213d]/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-5 bg-[#fff5e6] text-[#14213d] border-saffron/30 hover:bg-[#fff5e6]">
              <Sparkles className="h-3.5 w-3.5 text-saffron" />
              Roman Urdu AI captions + local payments
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#14213d] leading-[1.05]">
              Social media{" "}
              <span className="relative inline-block">
                <span className="relative z-10">scheduler</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-saffron/40 -z-0" />
              </span>{" "}
              jo actually{" "}
              <span className="text-saffron">Pakistani</span> businesses ke liye bana hai.
            </h1>
            <p className="mt-6 text-lg text-[#6b6b73] max-w-xl">
              Instagram & Facebook posts schedule karein, Roman Urdu mein AI captions
              generate karein, aur JazzCash/EasyPaisa se pay karein. Buffer & Hootsuite
              se sasti, aur local needs ke liye built.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={() => setAuthModal("signup")}
                className="gradient-saffron text-[#14213d] font-semibold shadow-brand hover:opacity-90 h-12 px-7"
              >
                <Rocket className="h-5 w-5" />
                Free shuru karein
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setAuthModal("login")}
                className="border-[#14213d]/20 text-[#14213d] hover:bg-[#14213d] hover:text-white h-12 px-7"
              >
                Demo dekhein
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#6b6b73]">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-saffron" /> Free forever plan</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-saffron" /> No credit card</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-saffron" /> 2 min setup</span>
            </div>
          </div>

          {/* Hero visual: dashboard preview */}
          <div className="relative">
            <HeroPreview />
          </div>
        </div>

        {/* Trust bar */}
        <div className="border-y border-[#e5e5e5] bg-[#fafafa]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-[#6b6b73]">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Connect karein:
              </span>
              <div className="flex items-center gap-5 sm:gap-7">
                <BrandIcon icon={Instagram} label="Instagram" color="#E1306C" />
                <BrandIcon icon={Facebook} label="Facebook" color="#1877F2" />
                <BrandIcon icon={Twitter} label="X" color="#0F1419" />
                <BrandIcon icon={Linkedin} label="LinkedIn" color="#0A66C2" />
                <BrandIcon icon={MessageCircle} label="WhatsApp" color="#25D366" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-[#14213d] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <Stat value="2,400+" label="Active businesses" />
          <Stat value="180K+" label="Posts scheduled" />
          <Stat value="PKR 1490" label="Pro plan / month" />
          <Stat value="4.9/5" label="User rating" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="Features"
            title="Sab kuch jo aap ko grow karne ke liye chahiye"
            subtitle="International tools mein jo missing hai — local payments, Urdu captions, WhatsApp integration — woh sab yahan hai."
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={Calendar}
              title="Smart calendar scheduling"
              desc="Drag-drop calendar mein posts schedule karein. Month/week view, timezone support, auto-publish queue."
              accent
            />
            <FeatureCard
              icon={Sparkles}
              title="AI captions (Roman Urdu + English)"
              desc="Ek click mein engaging captions generate karein. Tone choose karein — promotional, casual, storytelling."
            />
            <FeatureCard
              icon={BarChart3}
              title="Real analytics"
              desc="Reach, likes, comments, engagement rate — sab ek dashboard mein. Best time to post recommendations."
            />
            <FeatureCard
              icon={Users}
              title="Team & approval workflow"
              desc="Agency? Multiple clients manage karein. Client se post approve karayein before publishing."
            />
            <FeatureCard
              icon={Wallet}
              title="Local payments"
              desc="JazzCash, EasyPaisa aur bank transfer. PKR mein pricing, USD conversion ka jhanjhat nahi."
            />
            <FeatureCard
              icon={MessageCircle}
              title="WhatsApp Business integration"
              desc="Post links WhatsApp pe share karein, notifications paayein, customers se direct connect karein."
            />
            <FeatureCard
              icon={Clock}
              title="Best time to post"
              desc="AI aap ke followers ki activity dekh kar optimal posting times suggest karta hai."
            />
            <FeatureCard
              icon={Shield}
              title="Retry & reliability"
              desc="API downtime pe post fail ho to automatic retry. Failed posts ka alert email pe."
            />
            <FeatureCard
              icon={Globe}
              title="Multi-platform"
              desc="Instagram, Facebook, X/Twitter, LinkedIn, TikTok — sab ek place se manage karein."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 bg-[#fafafa]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="How it works"
            title="3 simple steps mein shuru karein"
            subtitle="No technical knowledge zaroori. Signup se pehli scheduled post tak sirf 5 minute."
          />
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <StepCard
              n={1}
              icon={Users}
              title="Account banayein"
              desc="Email se free signup karein. Instagram/Facebook account connect karein — 1 click mein."
            />
            <StepCard
              n={2}
              icon={Sparkles}
              title="Post banayein"
              desc="Caption likhein ya AI se generate karayein. Image upload karein, time schedule karein."
            />
            <StepCard
              n={3}
              icon={Rocket}
              title="Auto-publish"
              desc="LocalPost scheduled time pe khud publish karega. Analytics baad mein track karein."
            />
          </div>
        </div>
      </section>

      {/* AI caption demo */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-saffron/10 text-saffron border-saffron/30 hover:bg-saffron/10">
                <Sparkles className="h-3.5 w-3.5" /> AI powered
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#14213d] tracking-tight">
                Roman Urdu captions jo{" "}
                <span className="text-saffron">convert karti hain</span>
              </h2>
              <p className="mt-4 text-[#6b6b73] text-lg">
                International tools se Roman Urdu likhwana mushkil. LocalPost ke AI se
                aap natural, engaging captions paate hain jo aap ke local audience se
                baat karte hain.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "English + Roman Urdu dono support",
                  "4 alag alag tone options",
                  "Auto hashtag suggestions",
                  "Platform-specific character limits",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-[#14213d]">
                    <CheckCircle2 className="h-5 w-5 text-saffron shrink-0" />
                    <span className="font-medium">{t}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                onClick={() => setAuthModal("signup")}
                className="mt-8 gradient-saffron text-[#14213d] font-semibold shadow-brand hover:opacity-90"
              >
                Try AI captions free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <CaptionDemoCard />
          </div>
        </div>
      </section>

      {/* Local-first section */}
      <section id="local" className="py-20 gradient-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 -z-0 opacity-20">
          <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-saffron blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <Badge className="mb-4 bg-white/10 text-saffron border-white/20 hover:bg-white/10">
              🇵🇰 Local-first
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              International tools mein jo gap hai,{" "}
              <span className="text-saffron">wohum bharte hain</span>
            </h2>
            <p className="mt-4 text-white/70 text-lg">
              Buffer aur Hootsuite USD mein charge karte hain, Urdu support nahi, local
              payments nahi. LocalPost specifically Pakistani/South Asian SMBs ke liye bana.
            </p>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <LocalCard icon={Wallet} title="JazzCash & EasyPaisa" desc="Local wallets se pay karein. No USD conversion fees." />
            <LocalCard icon={Globe} title="Roman Urdu support" desc="AI captions aur UI mein Roman Urdu — natural aur relatable." />
            <LocalCard icon={Clock} title="PKT timezone" desc="Asia/Karachi default. Posts exactly waqt pe publish honge." />
            <LocalCard icon={TrendingUp} title="PKR pricing" desc="Pro plan sirf Rs. 1490/month — international tools se 3x sasta." />
          </div>
        </div>
      </section>

      {/* Competitor comparison table */}
      <section id="compare-table" className="py-20 bg-[#fafafa]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="Comparison"
            title="LocalPost vs international tools"
            subtitle="Dekhein kyun Pakistani/South Asian businesses ke liye LocalPost behtar hai."
          />
          <div className="mt-12 overflow-x-auto scroll-area-brand">
            <table className="w-full border-collapse min-w-[640px]">
              <thead>
                <tr>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-[#6b6b73]">Feature</th>
                  <th className="p-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <Logo size="sm" showText={false} />
                      <span className="text-sm font-bold text-[#14213d] mt-1">LocalPost</span>
                      <Badge className="mt-1 bg-saffron/15 text-[#b07300] border-0 text-[10px]">Local</Badge>
                    </div>
                  </th>
                  <th className="p-4 text-center text-sm font-bold text-[#6b6b73]">Buffer</th>
                  <th className="p-4 text-center text-sm font-bold text-[#6b6b73]">Hootsuite</th>
                  <th className="p-4 text-center text-sm font-bold text-[#6b6b73]">Publer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5]">
                {[
                  { feature: "Starting price", lp: "Rs. 0 / Free", others: "~$6/mo", hs: "~$99/mo", pub: "~$12/mo" },
                  { feature: "Local currency (PKR)", lp: true, others: false, hs: false, pub: false },
                  { feature: "JazzCash / EasyPaisa", lp: true, others: false, hs: false, pub: false },
                  { feature: "Roman Urdu AI captions", lp: true, others: false, hs: false, pub: false },
                  { feature: "WhatsApp Business", lp: true, others: false, hs: false, pub: false },
                  { feature: "PKT timezone default", lp: true, others: false, hs: false, pub: false },
                  { feature: "AI content ideas", lp: true, others: true, hs: true, pub: true },
                  { feature: "Team collaboration", lp: true, others: true, hs: true, pub: true },
                  { feature: "Bulk CSV upload", lp: true, others: true, hs: true, pub: true },
                  { feature: "Post A/B comparison", lp: true, others: false, hs: false, pub: false },
                  { feature: "Competitor tracking", lp: true, others: false, hs: true, pub: false },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white transition-colors">
                    <td className="p-4 text-sm font-medium text-[#14213d]">{row.feature}</td>
                    <td className="p-4 text-center bg-saffron/5">
                      {typeof row.lp === "boolean" ? (
                        row.lp ? <CheckCircle2 className="h-5 w-5 text-saffron mx-auto" /> : <X className="h-4 w-4 text-[#6b6b73] mx-auto opacity-30" />
                      ) : (
                        <span className="text-sm font-bold text-[#14213d]">{row.lp}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.others === "boolean" ? (
                        row.others ? <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" /> : <X className="h-4 w-4 text-[#6b6b73] mx-auto opacity-30" />
                      ) : (
                        <span className="text-xs text-[#6b6b73]">{row.others}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.hs === "boolean" ? (
                        row.hs ? <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" /> : <X className="h-4 w-4 text-[#6b6b73] mx-auto opacity-30" />
                      ) : (
                        <span className="text-xs text-[#6b6b73]">{row.hs}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.pub === "boolean" ? (
                        row.pub ? <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" /> : <X className="h-4 w-4 text-[#6b6b73] mx-auto opacity-30" />
                      ) : (
                        <span className="text-xs text-[#6b6b73]">{row.pub}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 text-center">
            <Button
              size="lg"
              onClick={() => setAuthModal("signup")}
              className="gradient-saffron text-[#14213d] font-semibold shadow-brand hover:opacity-90"
            >
              <Rocket className="h-5 w-5" /> Aaj hi switch karein
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-[#6b6b73] mt-3">Free plan se shuru karein. No credit card.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="Pricing"
            title="Transparent, PKR mein, sasta"
            subtitle="Free forever plan se shuru karein. Upgrade tab jab ready hon. Cancel anytime."
          />
          <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PricingCard
              plan="free"
              cta={() => setAuthModal("signup")}
              highlighted={false}
            />
            <PricingCard
              plan="pro"
              cta={() => setAuthModal("signup")}
              highlighted
            />
            <PricingCard
              plan="agency"
              cta={() => setAuthModal("signup")}
              highlighted={false}
            />
          </div>
          <p className="text-center mt-8 text-sm text-[#6b6b73]">
            Saare plans mein JazzCash, EasyPaisa aur bank transfer support. 14-day
            money-back guarantee.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#fafafa]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="Testimonials"
            title="Pakistani businesses kya kehte hain"
            subtitle="Real feedback from real local businesses using LocalPost."
          />
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <TestimonialCard
              name="Ayesha Khan"
              role="Owner, Urban Boutique"
              avatar="https://i.pravatar.cc/100?img=47"
              quote="Pehle Buffer use karti thi lekin USD payment aur English captions ka masla tha. LocalPost se Roman Urdu captions milti hain aur JazzCash se pay karti hoon. Game changer!"
              rating={5}
            />
            <TestimonialCard
              name="Bilal Ahmed"
              role="Freelance SMM"
              avatar="https://i.pravatar.cc/100?img=12"
              quote="5 clients manage karta hoon. Multi-account support aur approval workflow se mera kaam 10x asaan ho gaya. PKR mein pricing to bonus hai."
              rating={5}
            />
            <TestimonialCard
              name="Sana Malik"
              role="Founder, Lahore Eats"
              avatar="https://i.pravatar.cc/100?img=32"
              quote="Restaurant ke liye daily posts schedule karna ab mint ka kaam hai. Best time to post feature se engagement 40% barh gayi."
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="FAQ"
            title="Aap ke sawaal, hamare jawab"
            subtitle=""
          />
          <div className="mt-10 space-y-4">
            <FaqItem
              q="Kya free plan forever free hai?"
              a="Bilkul. Free plan mein 1 social account aur 10 posts/month milte hain, forever. Credit card ki zaroorat nahi."
            />
            <FaqItem
              q="JazzCash/EasyPaisa se payment kaise hogi?"
              a="Pro ya Agency plan select karne ke baad aap JazzCash, EasyPaisa, ya bank transfer se pay kar sakte hain. Stripe bhi support hai international users ke liye."
            />
            <FaqItem
              q="Roman Urdu captions kaise kaam karte hain?"
              a="Composer mein AI caption generator hai. Aap topic likhein, tone choose karein (casual, promotional, storytelling), aur AI 4 caption options dega — English aur Roman Urdu mein. Hashtags bhi suggest karta hai."
            />
            <FaqItem
              q="Instagram/Facebook API approval kitna time leta hai?"
              a="Connect karne ke liye Meta OAuth flow hai — 1 click mein connect. Pehle se developer access approved hai. Real posting ke liye business account zaroori hai."
            />
            <FaqItem
              q="Agency ke liye kya features hain?"
              a="Multi-account support, team members with roles (Admin/Editor/Viewer), approval workflow, white-label option, aur bulk upload (CSV)."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl gradient-saffron p-8 sm:p-16 text-center shadow-brand">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-[#14213d]" />
              <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#14213d]" />
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#14213d] tracking-tight">
                Aaj se hi grow karna shuru karein
              </h2>
              <p className="mt-4 text-[#14213d]/80 text-lg max-w-2xl mx-auto">
                5 minute mein signup karein, demo data ke saath explore karein. No
                credit card, no commitment.
              </p>
              <Button
                size="lg"
                onClick={() => setAuthModal("signup")}
                className="mt-8 bg-[#14213d] text-white font-semibold hover:bg-[#14213d]/90 h-13 px-8 text-base"
              >
                <Rocket className="h-5 w-5" />
                Free account banayein
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#14213d] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <div className="grid gap-10 md:grid-cols-5">
            <div className="md:col-span-2">
              <Logo variant="light" />
              <p className="mt-4 text-sm text-white/60 max-w-xs">
                Local-first social media scheduler built for Pakistan & South Asia.
                Roman Urdu captions, local payments, real growth.
              </p>
              <div className="mt-5 flex gap-3">
                <SocialBtn icon={Instagram} />
                <SocialBtn icon={Facebook} />
                <SocialBtn icon={Twitter} />
                <SocialBtn icon={MessageCircle} />
              </div>
            </div>
            <FooterCol
              title="Product"
              links={["Features", "Pricing", "AI Captions", "Calendar", "Analytics"]}
            />
            <FooterCol
              title="Company"
              links={["About Us", "Blog", "Careers", "Contact", "Partnerships"]}
            />
            <FooterCol
              title="Support"
              links={["Help Center", "Privacy Policy", "Terms of Service", "Status", "WhatsApp"]}
            />
          </div>
          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/50">
            <p>© {new Date().getFullYear()} LocalPost. Made with ❤️ in Pakistan.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Wallet className="h-4 w-4 text-saffron" /> JazzCash</span>
              <span className="flex items-center gap-1.5"><Wallet className="h-4 w-4 text-saffron" /> EasyPaisa</span>
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-saffron" /> Secure</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- sub components ---------- */

function HeroPreview() {
  return (
    <div className="relative">
      <div className="absolute -top-6 -right-6 hidden sm:flex items-center gap-2 rounded-xl bg-white shadow-lg border border-[#e5e5e5] px-4 py-2.5 z-10 animate-float-slow">
        <div className="grid place-items-center h-8 w-8 rounded-lg gradient-saffron">
          <Sparkles className="h-4 w-4 text-[#14213d]" />
        </div>
        <div>
          <div className="text-xs text-[#6b6b73]">AI caption ready</div>
          <div className="text-sm font-semibold text-[#14213d]">Roman Urdu + English</div>
        </div>
      </div>
      <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-2 rounded-xl bg-white shadow-lg border border-[#e5e5e5] px-4 py-2.5 z-10 animate-float-slow" style={{ animationDelay: "1.5s" }}>
        <div className="grid place-items-center h-8 w-8 rounded-lg bg-[#14213d]">
          <TrendingUp className="h-4 w-4 text-saffron" />
        </div>
        <div>
          <div className="text-xs text-[#6b6b73]">Engagement</div>
          <div className="text-sm font-semibold text-[#14213d]">+42% this week</div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e5e5e5] bg-white shadow-navy overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-[#e5e5e5] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-xs text-[#6b6b73] font-medium">localpost.pk/dashboard</span>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-[#6b6b73]">Welcome back, Ayesha</div>
              <div className="text-base font-bold text-[#14213d]">Dashboard overview</div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="flex items-center gap-1 rounded-full bg-[#fff5e6] px-2 py-1 text-[#14213d] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-saffron" /> Pro plan
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { l: "Scheduled", v: "12", c: "text-saffron" },
              { l: "Published", v: "47", c: "text-[#14213d]" },
              { l: "Reach", v: "18.2K", c: "text-[#14213d]" },
            ].map((s) => (
              <div key={s.l} className="rounded-lg border border-[#e5e5e5] p-3">
                <div className="text-[10px] uppercase text-[#6b6b73] font-medium">{s.l}</div>
                <div className={cn("text-lg font-bold mt-0.5", s.c)}>{s.v}</div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-[#e5e5e5] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#14213d]">This week</span>
              <span className="text-xs text-saffron font-medium">+42%</span>
            </div>
            <div className="flex items-end gap-1.5 h-20">
              {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t gradient-saffron"
                  style={{ height: `${h}%`, opacity: 0.4 + i * 0.08 }}
                />
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#fff5e6] p-2.5">
            <Calendar className="h-4 w-4 text-saffron" />
            <span className="text-xs text-[#14213d] font-medium">Next: Mon 9:00 AM — Winter collection post</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandIcon({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5" style={{ color }} />
      <span className="hidden sm:inline text-sm font-medium">{label}</span>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl sm:text-4xl font-extrabold text-saffron">{value}</div>
      <div className="text-sm text-white/60 mt-1">{label}</div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="text-xs font-bold uppercase tracking-wider text-saffron">{eyebrow}</div>
      <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#14213d] tracking-tight">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-[#6b6b73] text-lg">{subtitle}</p>}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  accent,
}: {
  icon: any;
  title: string;
  desc: string;
  accent?: boolean;
}) {
  return (
    <Card
      className={cn(
        "p-6 hover:shadow-navy transition-all hover:-translate-y-1 border-[#e5e5e5] group",
        accent && "border-saffron/40 bg-[#fffdf8]"
      )}
    >
      <div
        className={cn(
          "grid place-items-center h-11 w-11 rounded-xl mb-4 transition-colors",
          accent
            ? "gradient-saffron text-[#14213d]"
            : "bg-[#14213d] text-saffron group-hover:gradient-saffron group-hover:text-[#14213d]"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-bold text-[#14213d] text-lg">{title}</h3>
      <p className="mt-2 text-sm text-[#6b6b73] leading-relaxed">{desc}</p>
    </Card>
  );
}

function StepCard({ n, icon: Icon, title, desc }: { n: number; icon: any; title: string; desc: string }) {
  return (
    <div className="relative rounded-2xl border border-[#e5e5e5] bg-white p-7 hover:shadow-navy transition-all">
      <div className="absolute -top-3 -left-3 grid place-items-center h-9 w-9 rounded-full gradient-saffron text-[#14213d] font-bold shadow-brand">
        {n}
      </div>
      <div className="grid place-items-center h-12 w-12 rounded-xl bg-[#14213d] text-saffron mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-bold text-[#14213d] text-lg">{title}</h3>
      <p className="mt-2 text-sm text-[#6b6b73]">{desc}</p>
    </div>
  );
}

function CaptionDemoCard() {
  return (
    <div className="rounded-2xl border border-[#e5e5e5] bg-white shadow-navy overflow-hidden">
      <div className="gradient-navy px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="h-4 w-4 text-saffron" />
          <span className="text-sm font-semibold">AI Caption Generator</span>
        </div>
        <span className="text-[10px] text-white/60 uppercase font-medium">Live preview</span>
      </div>
      <div className="p-5 space-y-3">
        <div className="rounded-lg bg-[#f4f4f5] px-3 py-2.5">
          <div className="text-[10px] uppercase text-[#6b6b73] font-medium">Topic</div>
          <div className="text-sm text-[#14213d] font-medium">Winter sweater sale, 25% off</div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-saffron/10 text-[#14213d] border-saffron/30">Roman Urdu</Badge>
          <Badge variant="secondary" className="bg-[#f4f4f5] text-[#6b6b73]">Casual</Badge>
        </div>
        <div className="space-y-2.5">
          <div className="rounded-lg border border-saffron/30 bg-[#fffdf8] p-3.5">
            <p className="text-sm text-[#14213d] leading-relaxed">
              ❄️ Sardiyon ki special sale aa gayi! Warm sweaters par 25% off. Stock
              khatam hone se pehle order karein. 🧥✨
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {["#WinterSale", "#PakistaniFashion", "#KarachiShopping"].map((t) => (
                <span key={t} className="text-[10px] text-saffron font-medium">{t}</span>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-[#e5e5e5] p-3.5">
            <p className="text-sm text-[#14213d] leading-relaxed">
              🧥 Winter collection is here! Get 25% off on all sweaters this week.
              Stay warm, stay stylish. Shop now!
            </p>
          </div>
        </div>
        <Button className="w-full gradient-saffron text-[#14213d] font-semibold hover:opacity-90">
          <Sparkles className="h-4 w-4" /> Aur captions generate karein
        </Button>
      </div>
    </div>
  );
}

function LocalCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-6 hover:bg-white/10 transition-colors">
      <div className="grid place-items-center h-11 w-11 rounded-xl bg-saffron text-[#14213d] mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm text-white/60">{desc}</p>
    </div>
  );
}

function PricingCard({
  plan,
  cta,
  highlighted,
}: {
  plan: "free" | "pro" | "agency";
  cta: () => void;
  highlighted: boolean;
}) {
  const meta = PLAN_META[plan];
  const features: Record<string, string[]> = {
    free: [
      "1 social account",
      "10 posts / month",
      "Basic analytics",
      "Calendar view",
      "Community support",
    ],
    pro: [
      "5 social accounts",
      "Unlimited posts",
      "AI captions (Roman Urdu)",
      "Advanced analytics",
      "Best time to post",
      "Hashtag suggestions",
      "Priority support",
    ],
    agency: [
      "Unlimited accounts",
      "Team collaboration (5 seats)",
      "Approval workflow",
      "White-label option",
      "Bulk upload (CSV)",
      "Content library",
      "Dedicated manager",
    ],
  };
  return (
    <Card
      className={cn(
        "relative p-6 border transition-all",
        highlighted
          ? "border-saffron shadow-brand bg-[#fffdf8] scale-[1.02]"
          : "border-[#e5e5e5] hover:shadow-navy"
      )}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="gradient-saffron text-[#14213d] font-bold border-0 px-3">
            Most popular
          </Badge>
        </div>
      )}
      <div className="text-sm font-bold uppercase tracking-wider" style={{ color: meta.color }}>
        {meta.label}
      </div>
      <div className="mt-3 flex items-end gap-1">
        <span className="text-4xl font-extrabold text-[#14213d]">
          {meta.price === 0 ? "Rs. 0" : `Rs. ${meta.price.toLocaleString()}`}
        </span>
        {meta.price > 0 && <span className="text-sm text-[#6b6b73] mb-1">/month</span>}
      </div>
      <p className="mt-1 text-xs text-[#6b6b73]">
        {meta.accounts === 999 ? "Unlimited accounts" : `${meta.accounts} social accounts`} · {meta.postsPerMonth}
      </p>
      <Button
        onClick={cta}
        className={cn(
          "w-full mt-5 font-semibold",
          highlighted
            ? "gradient-saffron text-[#14213d] hover:opacity-90"
            : "bg-[#14213d] text-white hover:bg-[#14213d]/90"
        )}
      >
        {meta.price === 0 ? "Free shuru karein" : `${meta.label} choose karein`}
      </Button>
      <div className="mt-6 space-y-3">
        {features[plan].map((f) => (
          <div key={f} className="flex items-start gap-2.5 text-sm">
            <CheckCircle2 className="h-4 w-4 text-saffron shrink-0 mt-0.5" />
            <span className="text-[#14213d]">{f}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TestimonialCard({
  name,
  role,
  avatar,
  quote,
  rating,
}: {
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating: number;
}) {
  return (
    <Card className="p-6 border-[#e5e5e5] hover:shadow-navy transition-shadow">
      <div className="flex gap-1 mb-3">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-saffron text-saffron" />
        ))}
      </div>
      <p className="text-sm text-[#14213d] leading-relaxed">&ldquo;{quote}&rdquo;</p>
      <div className="mt-5 flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-saffron/30">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-saffron/20 text-[#14213d] font-semibold">
            {name.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="text-sm font-bold text-[#14213d]">{name}</div>
          <div className="text-xs text-[#6b6b73]">{role}</div>
        </div>
      </div>
    </Card>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-[#e5e5e5] overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#fafafa] transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-semibold text-[#14213d]">{q}</span>
        <span className={cn("text-saffron transition-transform", open && "rotate-45")}>+</span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-[#6b6b73] leading-relaxed">{a}</div>
      )}
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="text-sm font-bold text-white mb-3">{title}</div>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-sm text-white/60 hover:text-saffron transition-colors">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialBtn({ icon: Icon }: { icon: any }) {
  return (
    <button className="grid place-items-center h-9 w-9 rounded-lg bg-white/10 hover:bg-saffron hover:text-[#14213d] transition-colors text-white">
      <Icon className="h-4 w-4" />
    </button>
  );
}
