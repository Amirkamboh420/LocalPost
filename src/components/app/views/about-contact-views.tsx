"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Target,
  Users,
  Globe,
  Zap,
  Shield,
  Sparkles,
  Mail,
  Twitter,
  Instagram,
  Facebook,
} from "lucide-react";
import { useApp } from "@/store/app-store";
import { Logo } from "@/components/brand-logo";

export function AboutView() {
  const setView = useApp((s) => s.setView);
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center py-6">
        <div className="flex justify-center mb-4"><Logo size="lg" /></div>
        <h1 className="text-3xl font-extrabold text-[#14213d]">LocalPost ke baare mein</h1>
        <p className="mt-3 text-[#6b6b73] max-w-2xl mx-auto">
          Pakistani aur South Asian small businesses ke liye bana social media scheduler.
          Roman Urdu AI captions, local payments, aur tools jo actually aap ki needs samjhein.
        </p>
      </div>

      {/* mission */}
      <Card className="border-saffron/30 bg-[#fffdf8]">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="grid place-items-center h-12 w-12 rounded-xl gradient-saffron shrink-0">
            <Target className="h-6 w-6 text-[#14213d]" />
          </div>
          <div>
            <h2 className="font-bold text-[#14213d] text-lg">Hamari mission</h2>
            <p className="text-sm text-[#6b6b73] mt-1 leading-relaxed">
              International tools USD mein charge karte hain, Urdu support nahi, local payments nahi.
              LocalPost specifically Pakistani/South Asian SMBs ke liye bana — affordable PKR pricing,
              JazzCash/EasyPaisa, Roman Urdu AI captions, aur WhatsApp integration. Har chhoti business
              ko professional social media tools tak access mile.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* values */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Heart, title: "Local-first", desc: "Pakistan ke liye bana, Pakistan ki needs samjhta hai", color: "#fca311" },
          { icon: Zap, title: "AI-powered", desc: "Roman Urdu captions, hashtag ideas, best times", color: "#1877f2" },
          { icon: Shield, title: "Reliable", desc: "Auto-publish queue, retry logic, secure payments", color: "#10b981" },
        ].map((v) => (
          <Card key={v.title} className="border-[#e5e5e5] p-5 text-center">
            <div className="grid place-items-center h-12 w-12 rounded-xl mx-auto mb-3" style={{ backgroundColor: v.color + "20" }}>
              <v.icon className="h-6 w-6" style={{ color: v.color }} />
            </div>
            <h3 className="font-bold text-[#14213d]">{v.title}</h3>
            <p className="text-xs text-[#6b6b73] mt-1">{v.desc}</p>
          </Card>
        ))}
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Users, value: "2,400+", label: "Active businesses" },
          { icon: Globe, value: "180K+", label: "Posts scheduled" },
          { icon: Sparkles, value: "50K+", label: "AI captions generated" },
          { icon: Heart, value: "4.9/5", label: "User rating" },
        ].map((s, i) => (
          <Card key={i} className="border-[#e5e5e5] p-4 text-center">
            <s.icon className="h-5 w-5 text-saffron mx-auto mb-2" />
            <div className="text-xl font-extrabold text-[#14213d]">{s.value}</div>
            <div className="text-[10px] uppercase text-[#6b6b73]">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* team */}
      <Card className="border-[#e5e5e5]">
        <CardContent className="p-6">
          <h2 className="font-bold text-[#14213d] text-lg mb-4">Hamari team</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { name: "Ayesha Khan", role: "Founder & CEO", avatar: "https://i.pravatar.cc/100?img=47" },
              { name: "Bilal Ahmed", role: "CTO", avatar: "https://i.pravatar.cc/100?img=12" },
              { name: "Sana Malik", role: "Head of Product", avatar: "https://i.pravatar.cc/100?img=32" },
            ].map((m) => (
              <div key={m.name} className="text-center">
                <img src={m.avatar} alt={m.name} className="h-16 w-16 rounded-full mx-auto border-2 border-saffron/30" />
                <div className="mt-2 text-sm font-bold text-[#14213d]">{m.name}</div>
                <div className="text-xs text-[#6b6b73]">{m.role}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="rounded-2xl gradient-navy p-6 text-center text-white">
        <h2 className="text-xl font-bold">Hamari journey ka hissa banein</h2>
        <p className="text-sm text-white/70 mt-1">Free shuru karein, local payments se upgrade karein.</p>
        <Button onClick={() => setView("dashboard")} className="mt-4 gradient-saffron text-[#14213d] font-semibold">
          Dashboard pe jayein
        </Button>
      </div>
    </div>
  );
}

export function ContactView() {
  const setView = useApp((s) => s.setView);
  const setAuthModal = useApp((s) => s.setAuthModal);
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center py-6">
        <h1 className="text-3xl font-extrabold text-[#14213d]">Get in touch</h1>
        <p className="mt-3 text-[#6b6b73] max-w-2xl mx-auto">
          Sawal hai? Support chahiye? Demo chahiye? Hum yahan hain.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Mail, title: "Email", value: "hello@localpost.pk", desc: "24-48 ghante mein reply" },
          { icon: Sparkles, title: "Live Chat", value: "Mon–Fri, 9am–6pm PKT", desc: "In-app chat (jaald)" },
          { icon: Shield, title: "Support Tickets", value: "Submit karein", desc: "Tracker ke saath", action: () => setView("support") },
        ].map((c, i) => (
          <Card key={i} className="border-[#e5e5e5] p-5 text-center hover:shadow-navy transition-shadow">
            <div className="grid place-items-center h-12 w-12 rounded-xl bg-saffron/20 mx-auto mb-3">
              <c.icon className="h-6 w-6 text-saffron" />
            </div>
            <h3 className="font-bold text-[#14213d]">{c.title}</h3>
            <div className="text-sm text-saffron font-medium mt-1">{c.value}</div>
            <p className="text-xs text-[#6b6b73] mt-1">{c.desc}</p>
            {c.action && (
              <Button onClick={c.action} size="sm" className="mt-3 gradient-saffron text-[#14213d] font-semibold h-8">
                Open
              </Button>
            )}
          </Card>
        ))}
      </div>

      {/* social */}
      <Card className="border-[#e5e5e5]">
        <CardContent className="p-6 text-center">
          <h2 className="font-bold text-[#14213d] mb-3">Follow karein</h2>
          <div className="flex justify-center gap-3">
            {[Instagram, Twitter, Facebook].map((Icon, i) => (
              <button key={i} className="grid place-items-center h-10 w-10 rounded-lg bg-[#14213d] text-saffron hover:bg-saffron hover:text-[#14213d] transition-colors">
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* office */}
      <Card className="border-[#e5e5e5]">
        <CardContent className="p-6">
          <h2 className="font-bold text-[#14213d] text-lg mb-2">Office</h2>
          <p className="text-sm text-[#6b6b73]">
            LocalPost HQ<br />
            IT Tower, Shahrah-e-Faisal<br />
            Karachi, Pakistan 75300
          </p>
          <Badge className="mt-3 bg-[#fff5e6] text-[#b07300] border-0">🇵🇰 Made in Pakistan</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
