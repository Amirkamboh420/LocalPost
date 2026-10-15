// Shared types for LocalPost

export type Platform = "instagram" | "facebook" | "twitter" | "linkedin" | "tiktok";

export type Plan = "free" | "pro" | "agency";

export type PostStatus = "draft" | "scheduled" | "publishing" | "published" | "failed";

export type MediaType = "image" | "video" | "carousel" | "text";

export type UserRole = "owner" | "admin" | "editor" | "viewer";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  businessName: string | null;
  timezone: string;
  plan: Plan;
  role: UserRole;
  createdAt: string;
}

export interface Account {
  id: string;
  userId: string;
  platform: Platform;
  handle: string;
  displayName: string;
  avatar: string | null;
  followers: number;
  connected: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  accountId: string | null;
  caption: string;
  mediaUrls: string[];
  mediaType: MediaType;
  hashtags: string[];
  status: PostStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  account?: Account | null;
  metrics?: PostMetric | null;
}

export interface PostMetric {
  id: string;
  postId: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  saves: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: "post_published" | "post_failed" | "reminder" | "system" | "welcome";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ContentItem {
  id: string;
  userId: string;
  type: "image" | "video" | "template" | "caption";
  title: string;
  url: string | null;
  content: string | null;
  tags: string | null;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor" | "viewer";
  status: "invited" | "active" | "removed";
  avatarColor: string;
  createdAt: string;
  isOwner: boolean;
}

export interface Competitor {
  id: string;
  handle: string;
  platform: Platform;
  displayName: string;
  followers: number;
  avgEngagement: number;
  postFrequency: string;
  notes: string | null;
  color: string;
  createdAt: string;
}

export interface MediaItem {
  url: string;
  caption: string;
  createdAt: string;
  status: string;
  source: "post" | "library";
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
  status: string;
  reply: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ViewKey =
  | "dashboard"
  | "calendar"
  | "composer"
  | "accounts"
  | "analytics"
  | "content-library"
  | "templates"
  | "bulk-upload"
  | "approvals"
  | "team"
  | "compare"
  | "content-ideas"
  | "competitors"
  | "queue"
  | "report"
  | "media"
  | "notifications"
  | "settings"
  | "billing"
  | "about"
  | "contact"
  | "support"
  | "admin-dashboard"
  | "user-management";

export const PLATFORM_META: Record<
  Platform,
  { label: string; color: string; bg: string; charLimit: number }
> = {
  instagram: { label: "Instagram", color: "#E1306C", bg: "#FCE7F3", charLimit: 2200 },
  facebook: { label: "Facebook", color: "#1877F2", bg: "#DBEAFE", charLimit: 63206 },
  twitter: { label: "X / Twitter", color: "#0F1419", bg: "#F4F4F5", charLimit: 280 },
  linkedin: { label: "LinkedIn", color: "#0A66C2", bg: "#DBEAFE", charLimit: 3000 },
  tiktok: { label: "TikTok", color: "#000000", bg: "#F4F4F5", charLimit: 2200 },
};

export const PLAN_META: Record<
  Plan,
  { label: string; price: number; accounts: number; postsPerMonth: string; color: string }
> = {
  free: { label: "Free", price: 0, accounts: 1, postsPerMonth: "10 / month", color: "#6b6b73" },
  pro: { label: "Pro", price: 1490, accounts: 5, postsPerMonth: "Unlimited", color: "#fca311" },
  agency: {
    label: "Agency",
    price: 4490,
    accounts: 999,
    postsPerMonth: "Unlimited",
    color: "#14213d",
  },
};
