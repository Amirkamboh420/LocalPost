"use client";

import { useEffect } from "react";
import { useApp } from "@/store/app-store";
import { LandingPage } from "@/components/landing/landing-page";
import { AppShell } from "@/components/app/app-shell";
import { FullScreenLoader } from "@/components/app/full-screen-loader";

export default function Home() {
  const user = useApp((s) => s.user);
  const authLoading = useApp((s) => s.authLoading);
  const setAuthLoading = useApp((s) => s.setAuthLoading);
  const setUser = useApp((s) => s.setUser);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        setUser(data.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []);

  if (authLoading) return <FullScreenLoader />;
  if (!user) return <LandingPage />;
  return <AppShell />;
}
