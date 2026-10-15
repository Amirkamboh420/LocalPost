"use client";

import { useState } from "react";
import { useApp } from "@/store/app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  User as UserIcon,
  Clock,
  Bell,
  Mail,
  Shield,
  Store,
  Globe,
  Save,
  Loader2,
  Check,
} from "lucide-react";

const TIMEZONES = [
  "Asia/Karachi",
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Kathmandu",
  "Asia/Colombo",
  "UTC",
];

export function SettingsView() {
  const user = useApp((s) => s.user);
  const setUser = useApp((s) => s.setUser);
  const [name, setName] = useState(user?.name || "");
  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [timezone, setTimezone] = useState(user?.timezone || "Asia/Karachi");
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    emailFailed: true,
    emailPublished: false,
    emailWeekly: true,
    pushNotifs: true,
    aiSuggestions: true,
  });

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          businessName,
          timezone,
          prefs: {
            emailWeeklyReport: prefs.emailWeekly,
            emailFailed: prefs.emailFailed,
            emailPublished: prefs.emailPublished,
            pushNotifs: prefs.pushNotifs,
            aiSuggestions: prefs.aiSuggestions,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(data);
      toast.success("Settings save ho gayi");
    } catch (e: any) {
      toast.error(e.message || "Save fail");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-3xl mx-auto">
      {/* profile */}
      <Card className="border-[#e5e5e5]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-saffron" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-saffron/30">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback className="bg-saffron text-[#14213d] text-xl font-bold">
                {(name || email || "U").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm" className="border-[#e5e5e5]">
                Photo change karein
              </Button>
              <p className="text-xs text-[#6b6b73] mt-1">JPG, PNG. Max 2MB.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Naam</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b73]" />
                <Input value={name} onChange={(e) => setName(e.target.value)} className="pl-9" placeholder="Aap ka naam" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Business naam</Label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b73]" />
                <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="pl-9" placeholder="Boutique naam" />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} disabled className="bg-[#fafafa]" />
            <p className="text-xs text-[#6b6b73]">Email change nahi ho sakta demo mein.</p>
          </div>
        </CardContent>
      </Card>

      {/* localization */}
      <Card className="border-[#e5e5e5]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Globe className="h-4 w-4 text-saffron" />
            Localisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-[#6b6b73] flex items-center gap-1">
              <Clock className="h-3 w-3" /> Posts is timezone ke hisaab se schedule honge.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Currency</Label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-[#e5e5e5] px-3 py-2 bg-[#fafafa]">
                <span className="text-sm font-semibold text-[#14213d]">PKR (Rs.)</span>
                <Badge variant="secondary" className="ml-auto bg-[#fff5e6] text-[#b07300]">Local</Badge>
              </div>
            </div>
            <div>
              <Label className="text-xs">Language</Label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-[#e5e5e5] px-3 py-2 bg-[#fafafa]">
                <span className="text-sm font-semibold text-[#14213d]">English + Roman Urdu</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* notifications */}
      <Card className="border-[#e5e5e5]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Bell className="h-4 w-4 text-saffron" />
            Notification preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <PrefRow
            icon={Mail}
            title="Email jab post fail ho"
            desc="Failed posts ka email alert turant"
            checked={prefs.emailFailed}
            onChange={(v) => setPrefs({ ...prefs, emailFailed: v })}
          />
          <PrefRow
            icon={Check}
            title="Email jab post publish ho"
            desc="Har successful publish ki confirmation"
            checked={prefs.emailPublished}
            onChange={(v) => setPrefs({ ...prefs, emailPublished: v })}
          />
          <PrefRow
            icon={Mail}
            title="Weekly performance report"
            desc="Har Monday ko past week ki summary"
            checked={prefs.emailWeekly}
            onChange={(v) => setPrefs({ ...prefs, emailWeekly: v })}
          />
          <PrefRow
            icon={Bell}
            title="In-app push notifications"
            desc="Browser notifications on/off"
            checked={prefs.pushNotifs}
            onChange={(v) => setPrefs({ ...prefs, pushNotifs: v })}
          />
          <PrefRow
            icon={Check}
            title="AI best-time suggestions"
            desc="AI aap ko best posting times suggest kare"
            checked={prefs.aiSuggestions}
            onChange={(v) => setPrefs({ ...prefs, aiSuggestions: v })}
          />
        </CardContent>
      </Card>

      {/* weekly report subscription */}
      <Card className="border-[#e5e5e5]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Mail className="h-4 w-4 text-saffron" /> Weekly report email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-[#e5e5e5] bg-[#fafafa]">
            <div>
              <div className="text-sm font-semibold text-[#14213d]">Send to: {user?.email}</div>
              <div className="text-xs text-[#6b6b73]">
                {prefs.emailWeekly
                  ? "Subscribed · weekly digest aap ke inbox mein"
                  : "Not subscribed"}
              </div>
            </div>
            <Badge className={prefs.emailWeekly ? "bg-emerald-50 text-emerald-600 border-0" : "bg-[#f4f4f5] text-[#6b6b73] border-0"}>
              {prefs.emailWeekly ? "Active" : "Off"}
            </Badge>
          </div>
          <Button
            onClick={async () => {
              try {
                const res = await fetch("/api/report/send", { method: "POST" });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                toast.success(`Weekly report emailed to ${data.to}`);
              } catch (e: any) {
                toast.error(e.message || "Send fail");
              }
            }}
            className="gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand"
          >
            <Mail className="h-4 w-4" /> Send test report now
          </Button>
          <p className="text-[11px] text-[#6b6b73]">
            Demo mein email simulate hota hai (notification ban jata hai). Production mein Resend/SendGrid se real email jaata hai.
          </p>
        </CardContent>
      </Card>

      {/* security */}
      <Card className="border-[#e5e5e5]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Shield className="h-4 w-4 text-saffron" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full sm:w-auto border-[#e5e5e5]">Password change karein</Button>
          <div className="rounded-lg border border-[#e5e5e5] p-3 bg-[#fafafa]">
            <div className="text-xs font-semibold text-[#14213d] mb-1">Data & privacy</div>
            <p className="text-xs text-[#6b6b73]">
              Aap ka data Meta APIs ke through access kiya jata hai. Account delete karne par sab data clear ho jata hai.
            </p>
            <Button variant="ghost" size="sm" className="mt-2 text-red-600 hover:bg-red-50 hover:text-red-700 px-0">
              Account delete karein
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gradient-saffron text-[#14213d] font-semibold hover:opacity-90 shadow-brand"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}

function PrefRow({
  icon: Icon,
  title,
  desc,
  checked,
  onChange,
}: {
  icon: any;
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#e5e5e5] last:border-0">
      <div className="flex items-start gap-3">
        <div className="grid place-items-center h-8 w-8 rounded-lg bg-[#fff5e6] shrink-0">
          <Icon className="h-4 w-4 text-saffron" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[#14213d]">{title}</div>
          <div className="text-xs text-[#6b6b73]">{desc}</div>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
