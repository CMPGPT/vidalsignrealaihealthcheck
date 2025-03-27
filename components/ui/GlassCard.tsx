
import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  blur?: "sm" | "md" | "lg";
  opacity?: "light" | "medium" | "heavy";
  animation?: "fade" | "scale" | "none";
}

const GlassCard = ({
  children,
  className,
  hover = true,
  blur = "md",
  opacity = "medium",
  animation = "none",
  ...props
}: GlassCardProps) => {
  const blurClass = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
  };

  const opacityClass = {
    light: "bg-white/40 dark:bg-black/20",
    medium: "bg-white/60 dark:bg-black/30",
    heavy: "bg-white/80 dark:bg-black/40",
  };

  const animationClass = {
    fade: "animate-fade-in-up",
    scale: "animate-scale-in",
    none: "",
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-white/30 dark:border-white/10",
        blurClass[blur],
        opacityClass[opacity],
        hover ? "transition-all duration-300 shadow-glass hover:shadow-glass-hover" : "shadow-glass",
        animationClass[animation],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
