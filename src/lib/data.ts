import { db } from "@/lib/db";
import type { Account, Post, PostMetric, Platform, MediaType, PostStatus } from "@/lib/types";

function parseArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function mapAccount(a: any): Account {
  return {
    id: a.id,
    userId: a.userId,
    platform: a.platform as Platform,
    handle: a.handle,
    displayName: a.displayName,
    avatar: a.avatar,
    followers: a.followers ?? 0,
    connected: a.connected ?? true,
    createdAt: a.createdAt.toISOString(),
  };
}

export function mapMetric(m: any): PostMetric {
  return {
    id: m.id,
    postId: m.postId,
    likes: m.likes ?? 0,
    comments: m.comments ?? 0,
    shares: m.shares ?? 0,
    reach: m.reach ?? 0,
    impressions: m.impressions ?? 0,
    saves: m.saves ?? 0,
  };
}

export function mapPost(p: any): Post {
  return {
    id: p.id,
    userId: p.userId,
    accountId: p.accountId,
    caption: p.caption,
    mediaUrls: parseArray(p.mediaUrls),
    mediaType: p.mediaType as MediaType,
    hashtags: parseArray(p.hashtags),
    status: p.status as PostStatus,
    scheduledAt: p.scheduledAt ? p.scheduledAt.toISOString() : null,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    account: p.account ? mapAccount(p.account) : null,
    metrics: p.metrics ? mapMetric(p.metrics) : null,
  };
}

export async function getUserPosts(userId: string) {
  const rows = await db.post.findMany({
    where: { userId },
    include: { account: true, metrics: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapPost);
}

export async function getUserAccounts(userId: string) {
  const rows = await db.account.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapAccount);
}

export async function getUserNotifications(userId: string) {
  const rows = await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return rows.map((n) => ({
    id: n.id,
    userId: n.userId,
    type: n.type as any,
    title: n.title,
    message: n.message,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));
}
