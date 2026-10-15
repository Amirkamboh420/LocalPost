"use client";

import { useState } from "react";
import { useApp } from "@/store/app-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Plus,
  Trash2,
  CheckCircle2,
  Users,
  Loader2,
  Zap,
} from "lucide-react";
import { PlatformIcon } from "@/components/app/shared";
import type { Platform } from "@/lib/types";
import { cn } from "@/lib/utils";

const PLATFORMS: {
  key: Platform;
  label: string;
  desc: string;
  color: string;
  icon: any;
}[] = [
  { key: "instagram", label: "Instagram", desc: "Business account", color: "#E1306C", icon: Instagram },
  { key: "facebook", label: "Facebook Page", desc: "Business page", color: "#1877F2", icon: Facebook },
  { key: "twitter", label: "X / Twitter", desc: "Profile", color: "#0F1419", icon: Twitter },
  { key: "linkedin", label: "LinkedIn", desc: "Company page", color: "#0A66C2", icon: Linkedin },
];

export function AccountsView() {
  const accounts = useApp((s) => s.accounts);
  const setAccounts = useApp((s) => s.setAccounts);
  const [connectOpen, setConnectOpen] = useState(false);
  const [connecting, setConnecting] = useState<Platform | null>(null);

  async function connect(platform: Platform) {
    setConnecting(platform);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAccounts([...accounts, data.account]);
      toast.success(`${platform} account connect ho gaya!`);
      setConnectOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Connect fail");
    } finally {
      setConnecting(null);
    }
  }

  async function disconnect(id: string) {
    if (!confirm("Yeh account disconnect karein? Scheduled posts affect ho sakte hain.")) return;
    try {
      await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      setAccounts(accounts.filter((a) => a.id !== id));
      toast.success("Account disconnect ho gaya");
    } catch {
      toast.error("Disconnect fail");
    }
  }

  const totalFollowers = accounts.reduce((s, a) => s + a.followers, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      {/* summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="border-[#e5e5e5] p-4">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-lg bg-[#fff5e6]">
              <CheckCircle2 className="h-5 w-5 text-saffron" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#14213d]">{accounts.length}</div>
              <div className="text-xs text-[#6b6b73]">Accounts connected</div>
            </div>
          </div>
        </Card>
        <Card className="border-[#e5e5e5] p-4">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-lg bg-[#14213d]">
              <Users className="h-5 w-5 text-saffron" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#14213d]">{formatNum(totalFollowers)}</div>
              <div className="text-xs text-[#6b6b73]">Total followers</div>
            </div>
          </div>
        </Card>
        <Card className="col-span-2 sm:col-span-1 border-[#e5e5e5] p-4 bg-gradient-to-br from-[#fffdf8] to-white">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-lg gradient-saffron">
              <Zap className="h-5 w-5 text-[#14213d]" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#14213d]">Free plan limit: 1</div>
              <div className="text-xs text-[#6b6b73]">Upgrade for unlimited</div>
            </div>
          </div>
        </Card>
      </div>

      {/* connected */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#14213d]">Connected accounts</h2>
          <Button onClick={() => setConnectOpen(true)} className="gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand">
            <Plus className="h-4 w-4" /> Connect
          </Button>
        </div>

        {accounts.length === 0 ? (
          <Card className="border-dashed border-[#e5e5e5]">
            <CardContent className="py-14 text-center">
              <Users className="h-12 w-12 mx-auto text-[#6b6b73] mb-3" />
              <h3 className="font-bold text-[#14213d]">Koi account connected nahi</h3>
              <p className="text-sm text-[#6b6b73] mt-1">Instagram ya Facebook connect karke shuru karein.</p>
              <Button onClick={() => setConnectOpen(true)} className="mt-4 gradient-saffron text-[#14213d] font-semibold">
                <Plus className="h-4 w-4" /> Account connect karein
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {accounts.map((a) => (
              <Card key={a.id} className="border-[#e5e5e5] overflow-hidden hover:shadow-navy transition-shadow">
                <div className="p-4 flex items-start gap-3">
                  <div
                    className="grid place-items-center h-12 w-12 rounded-xl shrink-0 text-white"
                    style={{ backgroundColor: PLATFORMS.find((p) => p.key === a.platform)?.color || "#14213d" }}
                  >
                    <PlatformIcon platform={a.platform} className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#14213d] truncate">@{a.handle}</h3>
                      <Badge className="bg-emerald-50 text-emerald-600 border-0 text-[10px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" /> Connected
                      </Badge>
                    </div>
                    <div className="text-xs text-[#6b6b73] mt-0.5">{a.displayName}</div>
                    <div className="mt-2 flex items-center gap-4 text-xs">
                      <div>
                        <span className="font-bold text-[#14213d]">{formatNum(a.followers)}</span>
                        <span className="text-[#6b6b73] ml-1">followers</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => disconnect(a.id)}
                    className="grid place-items-center h-8 w-8 rounded-lg text-[#6b6b73] hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Disconnect"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* available platforms */}
      <div>
        <h2 className="text-lg font-bold text-[#14213d] mb-3">Available platforms</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PLATFORMS.map((p) => {
            const connected = accounts.filter((a) => a.platform === p.key).length;
            return (
              <Card key={p.key} className="border-[#e5e5e5] p-4 hover:shadow-navy transition-shadow">
                <div
                  className="grid place-items-center h-10 w-10 rounded-lg text-white mb-3"
                  style={{ backgroundColor: p.color }}
                >
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-[#14213d] text-sm">{p.label}</h3>
                <p className="text-xs text-[#6b6b73] mt-0.5">{p.desc}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-[#6b6b73]">
                    {connected > 0 ? `${connected} connected` : "Not connected"}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => connect(p.key)}
                    disabled={connecting === p.key}
                    className="border-[#e5e5e5] h-7 text-xs"
                  >
                    {connecting === p.key ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    Connect
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
        <p className="text-xs text-[#6b6b73] mt-3">
          * TikTok aur WhatsApp Business integration jald aa raha hai. Demo ke liye accounts mock data ke saath connect hote hain.
        </p>
      </div>

      {/* connect modal */}
      <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Account connect karein</DialogTitle>
            <DialogDescription>
              Ek platform choose karein. Demo ke liye account turant connect ho jayega.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.key}
                onClick={() => connect(p.key)}
                disabled={!!connecting}
                className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-[#e5e5e5] hover:border-saffron hover:bg-[#fffdf8] transition-colors disabled:opacity-50"
              >
                {connecting === p.key ? (
                  <Loader2 className="h-8 w-8 text-saffron animate-spin" />
                ) : (
                  <div
                    className="grid place-items-center h-12 w-12 rounded-xl text-white"
                    style={{ backgroundColor: p.color }}
                  >
                    <p.icon className="h-6 w-6" />
                  </div>
                )}
                <span className="text-sm font-semibold text-[#14213d]">{p.label}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatNum(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}
