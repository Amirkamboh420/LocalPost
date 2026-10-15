import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const now = () => new Date();
const daysFromNow = (d: number, h = 10, m = 0) => {
  const t = new Date();
  t.setDate(t.getDate() + d);
  t.setHours(h, m, 0, 0);
  return t;
};

export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // only seed if user has nothing yet
  const existing = await db.account.count({ where: { userId: user.id } });
  if (existing > 0) {
    return NextResponse.json({ seeded: false, reason: "already-has-data" });
  }

  // create demo accounts
  const ig = await db.account.create({
    data: {
      userId: user.id,
      platform: "instagram",
      handle: "urban.boutique.pk",
      displayName: "Urban Boutique",
      followers: 4820,
      connected: true,
    },
  });
  const fb = await db.account.create({
    data: {
      userId: user.id,
      platform: "facebook",
      handle: "Urban Boutique PK",
      displayName: "Facebook Page",
      followers: 2140,
      connected: true,
    },
  });
  const tw = await db.account.create({
    data: {
      userId: user.id,
      platform: "twitter",
      handle: "urbanboutique",
      displayName: "X / Twitter",
      followers: 980,
      connected: true,
    },
  });

  const media = (seed: string) =>
    `https://picsum.photos/seed/${seed}/800/800`;

  // published posts with metrics
  const published: { caption: string; media: string; daysAgo: number; account: string; reach: number; likes: number; comments: number; shares: number; saves: number; impressions: number }[] = [
    {
      caption:
        "Naya winter collection aa gaya! 🧥 Warm aur stylish, dono. Abhi order karein before stock runs out. #WinterCollection #PakistaniFashion",
      media: media("winter-coats"),
      daysAgo: 6,
      account: ig.id,
      reach: 3840,
      likes: 412,
      comments: 58,
      shares: 23,
      saves: 41,
      impressions: 5120,
    },
    {
      caption:
        "Weekend sale! Sabai products par 20% off. Sirf Saturday aur Sunday. Visit karein ya DM karein orders ke liye. 🛍️ #WeekendSale #KarachiShopping",
      media: media("sale-banner"),
      daysAgo: 4,
      account: fb.id,
      reach: 2210,
      likes: 198,
      comments: 34,
      shares: 51,
      saves: 12,
      impressions: 2980,
    },
    {
      caption:
        "Customer review of the week! ❤️ Aap ki feedback humari motivation hai. Thank you for trusting Urban Boutique. #CustomerLove",
      media: media("happy-customer"),
      daysAgo: 3,
      account: ig.id,
      reach: 5100,
      likes: 633,
      comments: 71,
      shares: 18,
      saves: 9,
      impressions: 6900,
    },
    {
      caption:
        "New arrivals alert! Fresh stock of summer lawn suits. Handpicked designs, reasonable prices. Slide into our DMs to order. 🌸 #LawnCollection #SummerVibes",
      media: media("lawn-suits"),
      daysAgo: 2,
      account: ig.id,
      reach: 4280,
      likes: 505,
      comments: 62,
      shares: 29,
      saves: 88,
      impressions: 5600,
    },
    {
      caption:
        "Did you know? We offer free delivery on orders above Rs. 3000 in Karachi. Tag a friend who loves shopping! 🚚 #FreeDelivery #Karachi",
      media: media("delivery-box"),
      daysAgo: 1,
      account: tw.id,
      reach: 1820,
      likes: 142,
      comments: 21,
      shares: 64,
      saves: 5,
      impressions: 2400,
    },
  ];

  for (const p of published) {
    const post = await db.post.create({
      data: {
        userId: user.id,
        accountId: p.account,
        caption: p.caption,
        mediaUrls: JSON.stringify([p.media]),
        mediaType: "image",
        hashtags: JSON.stringify(["#PakistaniFashion", "#Karachi", "#Shopping"]),
        status: "published",
        scheduledAt: daysFromNow(-p.daysAgo, 10, 0),
        publishedAt: daysFromNow(-p.daysAgo, 10, 0),
      },
    });
    await db.postMetric.create({
      data: {
        postId: post.id,
        reach: p.reach,
        likes: p.likes,
        comments: p.comments,
        shares: p.shares,
        saves: p.saves,
        impressions: p.impressions,
      },
    });
  }

  // scheduled posts
  const scheduled: { caption: string; media: string; inDays: number; hour: number; account: string }[] = [
    {
      caption:
        "Monday motivation! Naya week, naye goals. Apni dreams ke peeche bhagte raho. 💪 #MondayMotivation #Hustle",
      media: media("monday-motivation"),
      inDays: 1,
      hour: 9,
      account: ig.id,
    },
    {
      caption:
        "Flash sale announcement! Kal raat 8 baje, sirf 3 hours ke liye. Stay tuned! ⏰ #FlashSale #ComingSoon",
      media: media("flash-sale"),
      inDays: 2,
      hour: 20,
      account: fb.id,
    },
    {
      caption:
        "Behind the scenes! Dekhein hamari team kaise products pack karti hai. #BehindTheScenes #SmallBusiness",
      media: media("packaging-bts"),
      inDays: 3,
      hour: 14,
      account: ig.id,
    },
    {
      caption:
        "Thanksgiving post for 5000 followers! Giveaway coming soon. Turn on notifications. 🎉 #GiveawayAlert #5kFollowers",
      media: media("milestone-celebration"),
      inDays: 5,
      hour: 18,
      account: tw.id,
    },
  ];
  for (const p of scheduled) {
    await db.post.create({
      data: {
        userId: user.id,
        accountId: p.account,
        caption: p.caption,
        mediaUrls: JSON.stringify([p.media]),
        mediaType: "image",
        hashtags: JSON.stringify([]),
        status: "scheduled",
        scheduledAt: daysFromNow(p.inDays, p.hour, 0),
      },
    });
  }

  // a couple of drafts
  await db.post.create({
    data: {
      userId: user.id,
      accountId: ig.id,
      caption: "Draft: Eid special collection teaser — pending final copy...",
      mediaUrls: JSON.stringify([media("eid-collection")]),
      mediaType: "image",
      hashtags: JSON.stringify(["#EidCollection"]),
      status: "draft",
    },
  });
  await db.post.create({
    data: {
      userId: user.id,
      accountId: fb.id,
      caption: "Draft: Customer testimonial carousel — needs images",
      mediaUrls: JSON.stringify([media("carousel-1"), media("carousel-2")]),
      mediaType: "carousel",
      hashtags: JSON.stringify(["#Testimonials"]),
      status: "draft",
    },
  });

  // a failed post
  await db.post.create({
    data: {
      userId: user.id,
      accountId: tw.id,
      caption: "This post failed to publish due to API timeout. Retry needed.",
      mediaUrls: JSON.stringify([media("failed-post")]),
      mediaType: "image",
      hashtags: JSON.stringify([]),
      status: "failed",
      scheduledAt: daysFromNow(-1, 15, 0),
    },
  });

  // notifications
  await db.notification.create({
    data: {
      userId: user.id,
      type: "post_published",
      title: "Post publish ho gaya!",
      message: "Aapka 'New arrivals alert' post Instagram pe live ho gaya.",
      read: false,
      createdAt: daysFromNow(-1, 10, 5),
    },
  });
  await db.notification.create({
    data: {
      userId: user.id,
      type: "post_failed",
      title: "Post publish fail ho gaya",
      message: "Twitter post schedule kiya tha lekin API timeout ki wajah se fail ho gaya. Retry karein.",
      read: false,
      createdAt: daysFromNow(-1, 15, 2),
    },
  });
  await db.notification.create({
    data: {
      userId: user.id,
      type: "reminder",
      title: "Kal 3 posts schedule hain",
      message: "Aap ke kal ke liye 3 posts ready hain. Preview kar lein.",
      read: false,
      createdAt: now(),
    },
  });

  // content library items
  await db.contentItem.createMany({
    data: [
      { userId: user.id, type: "caption", title: "Sale announcement template", content: "Big sale! Up to {discount}% off. Only for {duration}. Shop now!", tags: "sale,promotion" },
      { userId: user.id, type: "caption", title: "New arrival caption", content: "Just dropped! Our newest {category} is here. DM to order.", tags: "new-arrival,product" },
      { userId: user.id, type: "image", title: "Brand logo pack", url: media("brand-logo"), tags: "logo,branding" },
      { userId: user.id, type: "image", title: "Product flatlay", url: media("product-flatlay"), tags: "product,flatlay" },
    ],
  });

  return NextResponse.json({ seeded: true });
}
