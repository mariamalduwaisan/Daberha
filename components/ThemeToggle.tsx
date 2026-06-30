"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`flex items-center gap-1.5 text-xs font-bold rounded-full border border-border bg-surface px-3 py-1.5 transition hover:border-primary hover:text-primary active:scale-95 ${className}`}
    >
      {theme === "dark"
        ? <Sun  size={13} className="text-amber-400" />
        : <Moon size={13} className="text-primary"   />
      }
      <span>{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
