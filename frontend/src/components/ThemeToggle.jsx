import React from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import { SunIcon, MoonIcon } from "./icons.jsx";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      onClick={toggle}
      role="switch"
      aria-checked={dark}
      aria-label="Toggle light or dark theme"
      className="relative flex h-8 w-16 items-center rounded-full border border-line bg-surface2 px-1 transition-colors"
    >
      <SunIcon size={14} className={`absolute left-1.5 transition-opacity ${dark ? "opacity-30" : "opacity-100 text-accent"}`} />
      <MoonIcon size={13} className={`absolute right-1.5 transition-opacity ${dark ? "opacity-100 text-accent" : "opacity-30"}`} />
      <span
        className="h-6 w-6 rounded-full bg-accent shadow-card transition-transform"
        style={{ transform: dark ? "translateX(32px)" : "translateX(0px)" }}
      />
    </button>
  );
}
