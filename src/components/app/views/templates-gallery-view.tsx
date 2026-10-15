"use client";

import { useState } from "react";
import { useApp } from "@/store/app-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Sparkles,
  Tag,
  ShoppingBag,
  Utensils,
  PartyPopper,
  Heart,
  Briefcase,
  BookOpen,
  Copy,
  Pencil,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  category: string;
  title: string;
  caption: string;
  hashtags: string[];
  tone: string;
}

const TEMPLATES: Template[] = [
  // Sales / Promotions
  {
    id: "t1", category: "Sales", title: "Flash sale announcement", tone: "promotional",
    caption: "⚡ FLASH SALE! Sirf 24 hours ke liye — sab products par 30% OFF! Stock khatam hone se pehle order karein. 🛍️\n\nLink in bio 📲",
    hashtags: ["FlashSale", "LimitedOffer", "ShopNow", "Discount"],
  },
  {
    id: "t2", category: "Sales", title: "Weekend special", tone: "promotional",
    caption: "Weekend ko special banayein! 🎉 Sat & Sun only — buy 2 get 1 FREE. Apne doston ke saath share karein. 👯‍♀️",
    hashtags: ["WeekendSpecial", "Buy2Get1", "WeekendVibes"],
  },
  {
    id: "t3", category: "Sales", title: "Clearance sale", tone: "promotional",
    caption: "Last chance! 🚨 Clearance sale — sab kuch must hui price pe. Once gone, gone for good. Shop now! 🛒",
    hashtags: ["ClearanceSale", "LastChance", "MustGo"],
  },
  // New arrivals
  {
    id: "t4", category: "New Arrivals", title: "Just dropped", tone: "excited",
    caption: "🚨 JUST DROPPED! Hamara naya collection aa gaya hai. Fresh designs, fresh vibes. Slide into DMs to order. ✨",
    hashtags: ["NewArrivals", "JustDropped", "FreshStock"],
  },
  {
    id: "t5", category: "New Arrivals", title: "Behind the scenes reveal", tone: "storytelling",
    caption: "Pichle 3 hafton se kuch bana rahe hain… aaj finally share kar sakte hain! 🤫 Swipe to see the new collection.",
    hashtags: ["NewCollection", "BehindTheScenes", "SneakPeek"],
  },
  // Food / Restaurant
  {
    id: "t6", category: "Food", title: "Daily special", tone: "casual",
    caption: "Aaj ka special: Desi karahi with naan 🔥 Order karein before 8 PM, free delivery in Karachi. 🚚 DM to order.",
    hashtags: ["DesiFood", "KarachiEats", "Foodie", "DailySpecial"],
  },
  {
    id: "t7", category: "Food", title: "Iftar deal (Ramzan)", tone: "festive",
    caption: "Ramzan Mubarak! 🌙 Iftar deal — buy any 2 platters, get dates + rooh afza free. Family pack available. 🍽️",
    hashtags: ["Ramzan", "IftarDeal", "RamzanMubarak", "FoodDeal"],
  },
  // Engagement
  {
    id: "t8", category: "Engagement", title: "Poll / question", tone: "interactive",
    caption: "Quick question for you! 👇\n\nAap ka favorite color jo hum stock karein?\n❤️ Red\n🧡 Orange\n💙 Blue\n🖤 Black\n\nComment karein!",
    hashtags: ["Poll", "Community", "YourChoice"],
  },
  {
    id: "t9", category: "Engagement", title: "Tag a friend", tone: "fun",
    caption: "Ek dosto ko tag karein jo yeh zaroor pasand aayega! 👇\n\n(Bonus: dono ko 10% discount code milega 😉)",
    hashtags: ["TagAFriend", "Share", "Discount"],
  },
  // Testimonial
  {
    id: "t10", category: "Testimonial", title: "Customer review", tone: "grateful",
    caption: "Customer review of the week! ❤️\n\n\"MashaAllah quality lajawab hai, delivery bhi time pe mili. Highly recommend!\" — @customer_name\n\nThank you for trusting us! 🙏",
    hashtags: ["CustomerLove", "Review", "HappyCustomer"],
  },
  // Milestones
  {
    id: "t11", category: "Milestones", title: "Followers milestone", tone: "celebratory",
    caption: "🎉 5,000 followers! Yeh mumkin nahi hote aap ke bina. To celebrate — GIVEAWAY coming soon! Turn on notifications. 🔔",
    hashtags: ["Milestone", "5KFollowers", "GiveawayAlert", "ThankYou"],
  },
  {
    id: "t12", category: "Milestones", title: "Anniversary", tone: "celebratory",
    caption: "3 saal ho gaye! 🎂 Humari journey ka hissa banne ke liye shukriya. Aap ke support se yeh mumkin hua. ❤️",
    hashtags: ["Anniversary", "3Years", "Grateful", "Journey"],
  },
  // Education / Tips
  {
    id: "t13", category: "Tips", title: "Quick tip carousel", tone: "educational",
    caption: "5 tips for better ____ 🧵 (swipe)\n\n1️⃣ Start small\n2️⃣ Be consistent\n3️⃣ Listen to feedback\n4️⃣ Quality > quantity\n5️⃣ Don't give up\n\nSave this post for later! 📌",
    hashtags: ["Tips", "HowTo", "Carousel", "Save"],
  },
  // Holiday / Festival
  {
    id: "t14", category: "Festival", title: "Eid Mubarak", tone: "festive",
    caption: "Eid Mubarak aap sab ko! 🌙✨ May this Eid bring happiness, prosperity, and blessings to you and your family. 🕌",
    hashtags: ["EidMubarak", "Eid", "Blessings", "Festival"],
  },
  {
    id: "t15", category: "Festival", title: "14 August", tone: "patriotic",
    caption: "Happy Independence Day! 🇵🇰 14 August — hamari azadi ka din. Apne desh se pyaar karein. 🤍💚",
    hashtags: ["14August", "Pakistan", "IndependenceDay", "Pakistani"],
  },
  // Business / Professional
  {
    id: "t16", category: "Business", title: "Behind the brand", tone: "storytelling",
    caption: "Kaise shuru hua hamara brand? 🤔\n\n2021 mein ek choti si shop se. Aaj 5,000+ customers ke saath. Hard work pays off. 💪",
    hashtags: ["BehindTheBrand", "SmallBusiness", "FounderStory"],
  },
];

const CATEGORIES = [
  { name: "All", icon: Sparkles },
  { name: "Sales", icon: ShoppingBag },
  { name: "New Arrivals", icon: Tag },
  { name: "Food", icon: Utensils },
  { name: "Engagement", icon: Heart },
  { name: "Testimonial", icon: Heart },
  { name: "Milestones", icon: PartyPopper },
  { name: "Tips", icon: BookOpen },
  { name: "Festival", icon: PartyPopper },
  { name: "Business", icon: Briefcase },
];

export function TemplatesGalleryView() {
  const openComposer = useApp((s) => s.openComposer);
  const upsertPost = useApp((s) => s.upsertPost);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = TEMPLATES.filter((t) => {
    if (category !== "All" && t.category !== category) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.caption.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function applyTemplate(t: Template) {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: t.caption,
          mediaUrls: [],
          mediaType: "text",
          hashtags: t.hashtags,
          accountId: null,
          scheduledAt: null,
          status: "draft",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      upsertPost(data.post);
      toast.success("Template post mein add ho gaya — Edit karke use karein");
      openComposer(data.post.id);
    } catch (e: any) {
      toast.error(e.message || "Template use nahi ho saka");
    }
  }

  function copyTemplate(t: Template) {
    const text = `${t.caption}\n\n${t.hashtags.map((h) => "#" + h).join(" ")}`;
    navigator.clipboard.writeText(text);
    toast.success("Caption copy ho gaya");
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-[#14213d] flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-saffron" /> Post templates
        </h2>
        <p className="text-sm text-[#6b6b73] mt-1">
          Ready-made captions jo convert karti hain. Ek click mein use karein aur customize karein.
        </p>
      </div>

      {/* search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b73]" />
        <Input
          placeholder="Templates search karein…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 max-w-md"
        />
      </div>

      {/* category chips */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.name}
            onClick={() => setCategory(c.name)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all border",
              category === c.name
                ? "gradient-saffron text-[#14213d] border-transparent shadow-brand"
                : "border-[#e5e5e5] text-[#6b6b73] hover:border-saffron/40 hover:bg-[#fff5e6]"
            )}
          >
            <c.icon className="h-3.5 w-3.5" />
            {c.name}
          </button>
        ))}
      </div>

      {/* templates grid */}
      {filtered.length === 0 ? (
        <Card className="border-dashed border-[#e5e5e5] p-10 text-center">
          <Search className="h-10 w-10 mx-auto text-[#6b6b73] mb-2" />
          <p className="text-sm text-[#6b6b73]">"{search}" ke liye koi template nahi mila</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <Card
              key={t.id}
              className="border-[#e5e5e5] p-4 hover:shadow-navy hover:-translate-y-0.5 transition-all group flex flex-col"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-saffron/15 text-[#b07300] border-0 text-[10px]">
                  {t.category}
                </Badge>
                <span className="text-[10px] text-[#6b6b73] capitalize">{t.tone}</span>
              </div>
              <h3 className="font-bold text-[#14213d] text-sm mb-2">{t.title}</h3>
              <p className="text-xs text-[#6b6b73] leading-relaxed flex-1 line-clamp-5 whitespace-pre-wrap">
                {t.caption}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {t.hashtags.slice(0, 4).map((h) => (
                  <span key={h} className="text-[10px] text-saffron">#{h}</span>
                ))}
                {t.hashtags.length > 4 && (
                  <span className="text-[10px] text-[#6b6b73]">+{t.hashtags.length - 4}</span>
                )}
              </div>
              <div className="flex gap-2 mt-3 opacity-80 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  onClick={() => applyTemplate(t)}
                  className="flex-1 gradient-saffron text-[#14213d] font-semibold h-8"
                >
                  <Pencil className="h-3.5 w-3.5" /> Use
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyTemplate(t)}
                  className="border-[#e5e5e5] h-8"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
