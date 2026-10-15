"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Mail, Lock, User as UserIcon, Store, Sparkles, Loader2 } from "lucide-react";
import { useApp } from "@/store/app-store";
import { Logo } from "@/components/brand-logo";

export function AuthModal() {
  const modal = useApp((s) => s.authModal);
  const setModal = useApp((s) => s.setAuthModal);
  const setUser = useApp((s) => s.setUser);
  const setView = useApp((s) => s.setView);
  const setAuthLoading = useApp((s) => s.setAuthLoading);

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");

  const open = modal !== null;
  const tab = modal === "signup" ? "signup" : modal === "forgot" ? "login" : "login";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login fail");
      setUser(data);
      setModal(null);
      toast.success("Khush aamdeed! Aap successfully login ho gaye.");
      // seed demo data if empty
      await ensureSeed();
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Login mein masla hua");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, businessName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup fail");
      setUser(data);
      setModal(null);
      toast.success("Account ban gaya! Demo data add ho raha hai…");
      await ensureSeed();
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Signup mein masla hua");
    } finally {
      setLoading(false);
    }
  }

  async function ensureSeed() {
    try {
      await fetch("/api/seed", { method: "POST" });
    } catch {}
    setAuthLoading(false);
  }

  async function handleDemo() {
    setLoading(true);
    try {
      // try login as demo, else signup
      let res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "demo@localpost.pk", password: "demo1234" }),
      });
      if (!res.ok) {
        res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "demo@localpost.pk",
            password: "demo1234",
            name: "Demo User",
            businessName: "Urban Boutique",
          }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Demo login fail");
      setUser(data);
      setModal(null);
      toast.success("Demo account load ho gaya! Explore karein.");
      await ensureSeed();
    } catch (err: any) {
      toast.error(err.message || "Demo login fail");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEmail("");
    setPassword("");
    setName("");
    setBusinessName("");
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && setModal(null)}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden">
        <div className="gradient-navy px-6 pt-6 pb-8 text-white">
          <Logo variant="light" size="md" />
          <DialogHeader className="mt-5 space-y-1.5 p-0 text-left">
            <DialogTitle className="text-xl font-bold text-white">
              {modal === "signup"
                ? "Account banayein"
                : modal === "forgot"
                ? "Password reset"
                : "Wapas aayein!"}
            </DialogTitle>
            <DialogDescription className="text-white/70">
              {modal === "signup"
                ? "30 second mein signup karein. Free plan turant available."
                : modal === "forgot"
                ? "Reset instructions bhejne ke liye email daalein."
                : "Apna email aur password daal ke login karein."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6">
          <Tabs value={tab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#f4f4f5]">
              <TabsTrigger
                value="login"
                onClick={() => setModal("login")}
                className="data-[state=active]:bg-white data-[state=active]:text-[#14213d]"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                onClick={() => setModal("signup")}
                className="data-[state=active]:bg-white data-[state=active]:text-[#14213d]"
              >
                Signup
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-5">
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b73]" />
                    <Input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@business.pk"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-pw">Password</Label>
                    <button
                      type="button"
                      onClick={() => setModal("forgot")}
                      className="text-xs text-saffron hover:underline font-medium"
                    >
                      Bhool gaye?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b73]" />
                    <Input
                      id="login-pw"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-saffron text-[#14213d] font-semibold hover:opacity-90"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Login karein"
                  )}
                </Button>
              </form>

              <DemoLogin onDemo={handleDemo} loading={loading} />
            </TabsContent>

            <TabsContent value="signup" className="mt-5">
              <form onSubmit={handleSignup} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="su-name">Naam</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b73]" />
                      <Input
                        id="su-name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Aap ka naam"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-biz">Business</Label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b73]" />
                      <Input
                        id="su-biz"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Boutique naam"
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b73]" />
                    <Input
                      id="su-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@business.pk"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-pw">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b73]" />
                    <Input
                      id="su-pw"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Kam az kam 6 characters"
                      className="pl-9"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-saffron text-[#14213d] font-semibold hover:opacity-90"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Free account banayein"
                  )}
                </Button>
                <p className="text-[11px] text-center text-[#6b6b73]">
                  Signup kar ke aap humari Terms & Privacy accept karte hain.
                </p>
              </form>

              <DemoLogin onDemo={handleDemo} loading={loading} />
            </TabsContent>

            <TabsContent value="forgot" className="mt-5">
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="fg-email">Email</Label>
                  <Input id="fg-email" type="email" placeholder="you@business.pk" />
                </div>
                <Button
                  onClick={() => {
                    toast.success(
                      "Agar email registered hai, reset link bhej diya gaya hai."
                    );
                    setModal("login");
                  }}
                  className="w-full gradient-saffron text-[#14213d] font-semibold"
                >
                  Reset link bhejein
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DemoLogin({ onDemo, loading }: { onDemo: () => void; loading: boolean }) {
  return (
    <div className="mt-4">
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#e5e5e5]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-[#6b6b73]">ya</span>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onDemo}
        disabled={loading}
        className="w-full border-[#14213d]/20 hover:bg-[#14213d] hover:text-white"
      >
        <Sparkles className="h-4 w-4 text-saffron" />
        Demo account try karein
      </Button>
    </div>
  );
}
