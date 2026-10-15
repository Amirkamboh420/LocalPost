import { cn } from "@/lib/utils";

export function Logo({
  className,
  variant = "dark",
  showText = true,
  size = "md",
}: {
  className?: string;
  variant?: "dark" | "light";
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const dims = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const textSize =
    size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl";
  const textColor = variant === "light" ? "text-white" : "text-[#14213d]";
  const subColor = variant === "light" ? "text-white/60" : "text-[#6b6b73]";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative grid place-items-center rounded-xl gradient-saffron shadow-brand",
          dims
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-1/2 w-1/2 text-[#14213d]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* paper-plane / post icon */}
          <path
            d="M21.5 2.5 2.5 11.2c-.9.4-.9 1.6 0 2l4.3 1.7 1.7 5.4c.3.8 1.3 1 1.9.4l2.4-2.3 4.5 3.3c.7.5 1.7.1 1.9-.7l3.4-17.6c.2-1-.7-1.8-1.6-1.4Z"
            fill="currentColor"
          />
        </svg>
      </div>
      {showText && (
        <div className="leading-none">
          <div className={cn("font-extrabold tracking-tight", textSize, textColor)}>
            Local<span className="text-saffron">Post</span>
          </div>
          <div className={cn("text-[10px] font-medium tracking-wide", subColor)}>
            Schedule • Post • Grow
          </div>
        </div>
      )}
    </div>
  );
}
