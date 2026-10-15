"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = mounted ? (resolvedTheme === "dark" || theme === "dark") : false;

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative grid place-items-center h-9 w-9 rounded-lg border border-[#e5e5e5] dark:border-white/10 bg-white dark:bg-white/5 text-[#14213d] dark:text-white hover:bg-[#fafafa] dark:hover:bg-white/10 transition-colors",
        className
      )}
    >
      <Sun
        className={cn(
          "h-4 w-4 absolute transition-all duration-300",
          isDark ? "rotate-0 scale-100" : "-rotate-90 scale-0"
        )}
      />
      <Moon
        className={cn(
          "h-4 w-4 absolute transition-all duration-300",
          isDark ? "rotate-90 scale-0" : "rotate-0 scale-100"
        )}
      />
    </button>
  );
}
