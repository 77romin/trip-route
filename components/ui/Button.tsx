"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            // variant
            "bg-black hover:bg-gray-800 text-white shadow-md shadow-black/10 hover:shadow-black/20":
              variant === "primary",
            "bg-gray-100 hover:bg-gray-200 text-black border border-gray-200 hover:border-gray-300":
              variant === "secondary",
            "hover:bg-gray-100 text-gray-500 hover:text-black":
              variant === "ghost",
            "border border-gray-200 hover:border-black text-black hover:bg-gray-50":
              variant === "outline",
          },
          {
            // size
            "h-9 px-4 text-sm": size === "sm",
            "h-11 px-6 text-base": size === "md",
            "h-14 px-8 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
