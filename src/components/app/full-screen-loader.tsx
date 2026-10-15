import { Logo } from "@/components/brand-logo";

export function FullScreenLoader() {
  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse">
          <Logo size="lg" />
        </div>
        <div className="flex items-center gap-2 text-sm text-[#6b6b73]">
          <span className="h-2 w-2 rounded-full bg-saffron animate-pulse" />
          Loading LocalPost…
        </div>
      </div>
    </div>
  );
}
